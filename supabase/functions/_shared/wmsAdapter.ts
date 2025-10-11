import { IntegrationAdapter, AdapterResponse } from './integrationAdapter.ts';

export interface WMSOrder {
  orderId: string;
  storeId: string;
  items: WMSOrderItem[];
  deliveryDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
}

export interface WMSOrderItem {
  sku: string;
  quantity: number;
  category: string;
}

export interface WMSDeliveryStatus {
  orderId: string;
  status: string;
  estimatedDelivery: string;
  trackingNumber?: string;
}

export class WMSAdapter extends IntegrationAdapter {
  constructor(apiKey: string) {
    super({
      baseUrl: Deno.env.get('WMS_BASE_URL') || 'https://api.wms.example.com',
      apiKey,
      timeout: 20000,
      maxRetries: 3
    });
  }

  /**
   * Submit new order
   */
  async submitOrder(order: WMSOrder): Promise<AdapterResponse<{ orderId: string }>> {
    return this.post<{ orderId: string }>('/v1/orders', order);
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<AdapterResponse<WMSDeliveryStatus>> {
    return this.get<WMSDeliveryStatus>(`/v1/orders/${orderId}/status`);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason: string): Promise<AdapterResponse> {
    return this.post(`/v1/orders/${orderId}/cancel`, { reason });
  }

  /**
   * Update order
   */
  async updateOrder(orderId: string, updates: Partial<WMSOrder>): Promise<AdapterResponse> {
    return this.put(`/v1/orders/${orderId}`, updates);
  }

  /**
   * Get delivery schedule
   */
  async getDeliverySchedule(storeId: string, fromDate: string, toDate: string): Promise<AdapterResponse> {
    return this.get(`/v1/deliveries?storeId=${storeId}&from=${fromDate}&to=${toDate}`);
  }
}
