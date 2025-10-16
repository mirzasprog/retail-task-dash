import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { KpiMetric } from '../../shared/models/kpi.model';
import { TaskSummary } from '../../shared/models/task.model';
import { StoreSummary } from '../../shared/models/store.model';
import { SalesCategoryBreakdown, SalesRecord } from '../../shared/models/sales.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private readonly stores: StoreSummary[] = [
    { id: 'store-001', name: '5th Avenue Flagship', location: 'New York, USA' },
    { id: 'store-002', name: 'SoMa Tech Hub', location: 'San Francisco, USA' },
    { id: 'store-003', name: 'Oxford Street Premier', location: 'London, UK' }
  ];

  private readonly kpis: Record<string, KpiMetric[]> = {
    'store-001': [
      { id: 'kpi-1', title: 'Daily Revenue', value: '$128,450', change: 12.4, trend: 'up', status: 'good', icon: 'payments' },
      { id: 'kpi-2', title: 'Conversion Rate', value: '6.4%', change: -0.8, trend: 'down', status: 'warning', icon: 'conversion_path' },
      { id: 'kpi-3', title: 'Avg. Basket Size', value: '$86.20', change: 4.1, trend: 'up', status: 'good', icon: 'shopping_bag' }
    ],
    'store-002': [
      { id: 'kpi-1', title: 'Daily Revenue', value: '$86,120', change: 9.8, trend: 'up', status: 'good', icon: 'payments' },
      { id: 'kpi-2', title: 'Conversion Rate', value: '4.9%', change: 0.4, trend: 'up', status: 'warning', icon: 'conversion_path' },
      { id: 'kpi-3', title: 'Avg. Basket Size', value: '$67.30', change: -1.1, trend: 'down', status: 'warning', icon: 'shopping_bag' }
    ],
    'store-003': [
      { id: 'kpi-1', title: 'Daily Revenue', value: '£96,020', change: 6.4, trend: 'up', status: 'good', icon: 'payments' },
      { id: 'kpi-2', title: 'Conversion Rate', value: '5.7%', change: 1.2, trend: 'up', status: 'good', icon: 'conversion_path' },
      { id: 'kpi-3', title: 'Avg. Basket Size', value: '£74.10', change: 0.8, trend: 'up', status: 'good', icon: 'shopping_bag' }
    ]
  };

  private readonly todayTasks: Record<string, TaskSummary[]> = {
    'store-001': [
      { id: 'task-1', title: 'Front window refresh', status: 'in-progress', priority: 'high', dueDate: '09:30' },
      { id: 'task-2', title: 'Click & collect staging', status: 'pending', priority: 'medium', dueDate: '10:00' },
      { id: 'task-3', title: 'Inventory cycle count', status: 'done', priority: 'high', dueDate: '08:30' }
    ],
    'store-002': [
      { id: 'task-4', title: 'POS hardware updates', status: 'pending', priority: 'high', dueDate: '11:00' },
      { id: 'task-5', title: 'Storefront sanitization', status: 'in-progress', priority: 'medium', dueDate: '12:30' },
      { id: 'task-6', title: 'Online order audits', status: 'pending', priority: 'medium', dueDate: '14:00' }
    ],
    'store-003': [
      { id: 'task-7', title: 'Weekend promo signage', status: 'done', priority: 'medium', dueDate: '09:15' },
      { id: 'task-8', title: 'Luxury fitting rooms', status: 'in-progress', priority: 'high', dueDate: '10:45' },
      { id: 'task-9', title: 'Click & collect prep', status: 'pending', priority: 'medium', dueDate: '13:30' }
    ]
  };

  private readonly salesHistory: Record<string, SalesRecord[]> = {
    'store-001': [
      { id: 's-1', storeId: 'store-001', department: 'Apparel', sales: 64000, target: 59000, variance: 8.5, trend: 'up' },
      { id: 's-2', storeId: 'store-001', department: 'Home & Living', sales: 22800, target: 21000, variance: 5.7, trend: 'up' },
      { id: 's-3', storeId: 'store-001', department: 'Technology', sales: 41650, target: 47200, variance: -5.3, trend: 'down' }
    ],
    'store-002': [
      { id: 's-4', storeId: 'store-002', department: 'Apparel', sales: 43800, target: 45200, variance: -3.1, trend: 'down' },
      { id: 's-5', storeId: 'store-002', department: 'Home & Living', sales: 15800, target: 14400, variance: 6.2, trend: 'up' },
      { id: 's-6', storeId: 'store-002', department: 'Technology', sales: 26500, target: 23800, variance: 3.9, trend: 'up' }
    ],
    'store-003': [
      { id: 's-7', storeId: 'store-003', department: 'Apparel', sales: 50800, target: 47200, variance: 6.9, trend: 'up' },
      { id: 's-8', storeId: 'store-003', department: 'Home & Living', sales: 24600, target: 22000, variance: 4.3, trend: 'up' },
      { id: 's-9', storeId: 'store-003', department: 'Technology', sales: 31500, target: 29800, variance: 2.4, trend: 'up' }
    ]
  };

  private readonly categories: Record<string, SalesCategoryBreakdown[]> = {
    'store-001': [
      { category: 'Apparel', sales: 64000, percentage: 42 },
      { category: 'Footwear', sales: 28500, percentage: 19 },
      { category: 'Accessories', sales: 18800, percentage: 12 },
      { category: 'Beauty', sales: 17200, percentage: 11 },
      { category: 'Home', sales: 12800, percentage: 8 }
    ],
    'store-002': [
      { category: 'Apparel', sales: 43800, percentage: 37 },
      { category: 'Footwear', sales: 21200, percentage: 18 },
      { category: 'Technology', sales: 26500, percentage: 22 },
      { category: 'Home', sales: 15800, percentage: 13 },
      { category: 'Beauty', sales: 9200, percentage: 7 }
    ],
    'store-003': [
      { category: 'Apparel', sales: 50800, percentage: 39 },
      { category: 'Luxury', sales: 24600, percentage: 19 },
      { category: 'Footwear', sales: 19800, percentage: 15 },
      { category: 'Accessories', sales: 17200, percentage: 13 },
      { category: 'Beauty', sales: 11200, percentage: 9 }
    ]
  };

  getStores(): Observable<StoreSummary[]> {
    return of(this.stores).pipe(delay(150));
  }

  getKpis(storeId: string): Observable<KpiMetric[]> {
    return of(this.kpis[storeId] ?? []).pipe(delay(150));
  }

  getTodayTasks(storeId: string): Observable<TaskSummary[]> {
    return of(this.todayTasks[storeId] ?? []).pipe(delay(150));
  }

  getSalesHistory(storeId: string): Observable<SalesRecord[]> {
    return of(this.salesHistory[storeId] ?? []).pipe(delay(200));
  }

  getCategoryBreakdown(storeId: string): Observable<SalesCategoryBreakdown[]> {
    return of(this.categories[storeId] ?? []).pipe(delay(200));
  }
}
