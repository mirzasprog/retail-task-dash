import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export class IdempotencyService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  /**
   * Check if request with this idempotency key already exists
   * Returns cached response if found
   */
  async checkIdempotency(
    idempotencyKey: string,
    endpoint: string,
    requestBody: any
  ): Promise<{ cached: boolean; response?: any }> {
    try {
      const requestHash = await this.hashRequest(requestBody);

      const { data, error } = await this.supabase
        .from('idempotency_keys')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error checking idempotency:', error);
        return { cached: false };
      }

      if (!data) {
        return { cached: false };
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        // Clean up expired key
        await this.supabase
          .from('idempotency_keys')
          .delete()
          .eq('id', data.id);
        return { cached: false };
      }

      // Verify request hash matches (same request body)
      if (data.request_hash !== requestHash) {
        throw new Error('Idempotency key reused with different request body');
      }

      return {
        cached: true,
        response: {
          status: data.response_status,
          body: data.response_body
        }
      };
    } catch (error) {
      console.error('Idempotency check failed:', error);
      throw error;
    }
  }

  /**
   * Store response for idempotency
   */
  async storeIdempotency(
    idempotencyKey: string,
    endpoint: string,
    requestBody: any,
    responseStatus: number,
    responseBody: any,
    ttlHours = 24
  ): Promise<void> {
    try {
      const requestHash = await this.hashRequest(requestBody);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + ttlHours);

      await this.supabase
        .from('idempotency_keys')
        .insert({
          idempotency_key: idempotencyKey,
          endpoint,
          request_hash: requestHash,
          response_status: responseStatus,
          response_body: responseBody,
          expires_at: expiresAt.toISOString()
        });
    } catch (error) {
      console.error('Failed to store idempotency key:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Hash request body for comparison
   */
  private async hashRequest(requestBody: any): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(requestBody));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
