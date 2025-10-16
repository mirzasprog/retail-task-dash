import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { KpiMetric } from '../../shared/models/kpi.model';
import { TaskSummary } from '../../shared/models/task.model';
import { StoreSummary } from '../../shared/models/store.model';
import { SalesCategoryBreakdown, SalesRecord } from '../../shared/models/sales.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getStores(): Observable<StoreSummary[]> {
    return this.http.get<StoreSummary[]>(`${environment.apiUrl}/stores`);
  }

  getDashboardKpis(storeId: string): Observable<KpiMetric[]> {
    return this.http.get<KpiMetric[]>(`${environment.apiUrl}/stores/${storeId}/kpis`);
  }

  getTodayTasks(storeId: string): Observable<TaskSummary[]> {
    return this.http.get<TaskSummary[]>(`${environment.apiUrl}/stores/${storeId}/tasks/today`);
  }

  getAllTasks(storeId: string): Observable<TaskSummary[]> {
    return this.http.get<TaskSummary[]>(`${environment.apiUrl}/stores/${storeId}/tasks`);
  }

  getSalesHistory(storeId: string): Observable<SalesRecord[]> {
    return this.http.get<SalesRecord[]>(`${environment.apiUrl}/stores/${storeId}/sales/history`);
  }

  getCategoryBreakdown(storeId: string): Observable<SalesCategoryBreakdown[]> {
    return this.http.get<SalesCategoryBreakdown[]>(`${environment.apiUrl}/stores/${storeId}/sales/categories`);
  }
}
