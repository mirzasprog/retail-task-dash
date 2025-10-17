import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { KpiMetric } from '../../shared/models/kpi.model';
import { TaskSummary } from '../../shared/models/task.model';
import { StoreSummary } from '../../shared/models/store.model';
import { SalesRecord } from '../../shared/models/sales.model';
import { HqOverview } from '../../shared/models/reporting.model';
import { Region } from '../../shared/models/region.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getStores(filters?: { regionId?: string; userId?: string }): Observable<StoreSummary[]> {
    let params = new HttpParams();
    if (filters?.regionId) {
      params = params.set('regionId', filters.regionId);
    }
    if (filters?.userId) {
      params = params.set('userId', filters.userId);
    }
    return this.http.get<StoreSummary[]>(`${environment.apiUrl}/stores`, { params });
  }

  getStoreDashboard(storeId: string): Observable<{ kpis: KpiMetric[]; sales: SalesRecord[]; tasks: TaskSummary[] }> {
    return this.http.get<{ kpis: KpiMetric[]; sales: SalesRecord[]; tasks: TaskSummary[] }>(
      `${environment.apiUrl}/dashboard/store/${storeId}`
    );
  }

  getStoreTasks(storeId: string): Observable<TaskSummary[]> {
    return this.http.get<TaskSummary[]>(`${environment.apiUrl}/dashboard/store/${storeId}/tasks`);
  }

  getRegionKpis(regionId: string): Observable<KpiMetric[]> {
    return this.http.get<KpiMetric[]>(`${environment.apiUrl}/dashboard/region/${regionId}/kpis`);
  }

  getRegionSales(regionId: string): Observable<SalesRecord[]> {
    return this.http.get<SalesRecord[]>(`${environment.apiUrl}/dashboard/region/${regionId}/sales`);
  }

  getHqOverview(startDate?: string, endDate?: string): Observable<HqOverview> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<HqOverview>(`${environment.apiUrl}/reports/hq/overview`, { params });
  }

  exportHqOverview(startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get(`${environment.apiUrl}/reports/hq/export`, { params, responseType: 'blob' });
  }

  getRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(`${environment.apiUrl}/regions`);
  }
}
