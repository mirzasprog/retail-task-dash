import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export interface AdapterConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
}

export interface AdapterResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  latency: number;
  requestId: string;
}

export class IntegrationAdapter {
  protected config: AdapterConfig;
  protected supabase: any;

  constructor(config: AdapterConfig) {
    this.config = {
      timeout: 10000,
      maxRetries: 3,
      ...config
    };

    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  /**
   * Make HTTP request with retry logic and exponential backoff
   */
  protected async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit,
    retries = 0
  ): Promise<AdapterResponse<T>> {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    const fullUrl = `${this.config.baseUrl}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Request-ID': requestId,
          ...options.headers
        }
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      // Log to sync_logs
      await this.logSync(endpoint, options.method || 'GET', response.status, latency, requestId, options.body as string);

      if (!response.ok) {
        const errorText = await response.text();
        
        // Retry on 5xx errors or rate limits
        if ((response.status >= 500 || response.status === 429) && retries < (this.config.maxRetries || 3)) {
          const backoffDelay = Math.pow(2, retries) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return this.requestWithRetry(endpoint, options, retries + 1);
        }

        return {
          success: false,
          error: errorText || `HTTP ${response.status}`,
          statusCode: response.status,
          latency,
          requestId
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
        statusCode: response.status,
        latency,
        requestId
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log failed request
      await this.logSync(endpoint, options.method || 'GET', 0, latency, requestId, options.body as string, errorMessage);

      // Retry on network errors
      if (retries < (this.config.maxRetries || 3)) {
        const backoffDelay = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return this.requestWithRetry(endpoint, options, retries + 1);
      }

      return {
        success: false,
        error: errorMessage,
        latency,
        requestId
      };
    }
  }

  /**
   * Log sync activity to database
   */
  protected async logSync(
    endpoint: string,
    method: string,
    status: number,
    latency: number,
    requestId: string,
    payload?: string,
    errorMessage?: string
  ) {
    try {
      const payloadHash = payload 
        ? await this.hashPayload(payload)
        : null;

      await this.supabase.from('sync_logs').insert({
        endpoint,
        method,
        status,
        latency_ms: latency,
        payload_hash: payloadHash,
        request_id: requestId,
        error_message: errorMessage || null
      });
    } catch (error) {
      console.error('Failed to log sync:', error);
    }
  }

  /**
   * Create hash of payload for logging
   */
  protected async hashPayload(payload: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<AdapterResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any): Promise<AdapterResponse<T>> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: any): Promise<AdapterResponse<T>> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<AdapterResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { method: 'DELETE' });
  }
}
