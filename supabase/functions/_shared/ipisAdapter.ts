import { IntegrationAdapter, AdapterResponse } from './integrationAdapter.ts';

export interface IPISInventoryItem {
  sku: string;
  quantity: number;
  location: string;
  lastUpdated: string;
}

export interface IPISPriceUpdate {
  sku: string;
  price: number;
  effectiveDate: string;
}

export class IPISAdapter extends IntegrationAdapter {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  private cacheTTL = 2 * 60 * 1000; // 2 minutes

  constructor(apiKey: string) {
    super({
      baseUrl: Deno.env.get('IPIS_BASE_URL') || 'https://api.ipis.example.com',
      apiKey,
      timeout: 15000,
      maxRetries: 3
    });
  }

  /**
   * Get inventory with caching
   */
  async getInventory(storeId: string): Promise<AdapterResponse<IPISInventoryItem[]>> {
    const cacheKey = `inventory_${storeId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expires > Date.now()) {
      console.log('Cache hit for inventory:', storeId);
      return {
        success: true,
        data: cached.data,
        latency: 0,
        requestId: 'cached'
      };
    }

    const response = await this.get<IPISInventoryItem[]>(`/v1/stores/${storeId}/inventory`);

    if (response.success && response.data) {
      this.cache.set(cacheKey, {
        data: response.data,
        expires: Date.now() + this.cacheTTL
      });
    }

    return response;
  }

  /**
   * Update prices
   */
  async updatePrices(storeId: string, prices: IPISPriceUpdate[]): Promise<AdapterResponse> {
    return this.post(`/v1/stores/${storeId}/prices`, { prices });
  }

  /**
   * Get product details
   */
  async getProduct(sku: string): Promise<AdapterResponse> {
    const cacheKey = `product_${sku}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expires > Date.now()) {
      return {
        success: true,
        data: cached.data,
        latency: 0,
        requestId: 'cached'
      };
    }

    const response = await this.get(`/v1/products/${sku}`);

    if (response.success && response.data) {
      this.cache.set(cacheKey, {
        data: response.data,
        expires: Date.now() + this.cacheTTL
      });
    }

    return response;
  }

  /**
   * Clear cache
   */
  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}
