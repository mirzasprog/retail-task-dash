export interface SalesRecord {
  id: string;
  storeId: string;
  department: string;
  sales: number;
  target: number;
  variance: number;
  trend: 'up' | 'down';
  contribution: number;
}

export interface SalesCategoryBreakdown {
  storeId: string;
  category: string;
  sales: number;
  percentage: number;
}
