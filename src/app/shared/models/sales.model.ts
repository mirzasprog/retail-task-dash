export interface SalesRecord {
  id: string;
  storeId: string;
  department: string;
  sales: number;
  target: number;
  variance: number;
  trend: 'up' | 'down';
}

export interface SalesCategoryBreakdown {
  category: string;
  sales: number;
  percentage: number;
}
