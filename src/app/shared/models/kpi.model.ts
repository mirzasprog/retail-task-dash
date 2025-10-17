export interface KpiMetric {
  id: string;
  metric: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  status: 'good' | 'warning' | 'critical';
}
