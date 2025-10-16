import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { KpiMetric } from '../../shared/models/kpi.model';
import { TaskSummary } from '../../shared/models/task.model';
import { StoreSummary } from '../../shared/models/store.model';
import { SalesCategoryBreakdown, SalesRecord } from '../../shared/models/sales.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  constructor(private readonly api: ApiService) {}

  getStores(): Observable<StoreSummary[]> {
    return this.api.getStores();
  }

  getKpis(storeId: string): Observable<KpiMetric[]> {
    return this.api.getDashboardKpis(storeId);
  }

  getTodayTasks(storeId: string): Observable<TaskSummary[]> {
    return this.api.getTodayTasks(storeId);
  }

  getSalesHistory(storeId: string): Observable<SalesRecord[]> {
    return this.api.getSalesHistory(storeId);
  }

  getCategoryBreakdown(storeId: string): Observable<SalesCategoryBreakdown[]> {
    return this.api.getCategoryBreakdown(storeId);
  }
}
