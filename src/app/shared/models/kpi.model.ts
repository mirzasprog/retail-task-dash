export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  status: 'good' | 'warning' | 'critical';
  icon: string;
}
