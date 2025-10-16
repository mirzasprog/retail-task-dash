import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DashboardDataService } from '../../core/services/dashboard-data.service';
import { StoreSummary } from '../../shared/models/store.model';
import { KpiMetric } from '../../shared/models/kpi.model';
import { TaskSummary } from '../../shared/models/task.model';
import { SalesCategoryBreakdown, SalesRecord } from '../../shared/models/sales.model';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {
  stores: StoreSummary[] = [];
  selectedStoreId: string | null = null;

  kpis$: Observable<KpiMetric[]> | undefined;
  todayTasks$: Observable<TaskSummary[]> | undefined;
  sales$: Observable<SalesRecord[]> | undefined;
  categories$: Observable<SalesCategoryBreakdown[]> | undefined;

  loading = true;

  constructor(private readonly dashboardData: DashboardDataService) {}

  ngOnInit(): void {
    this.dashboardData.getStores()
      .pipe(
        tap(stores => {
          this.stores = stores;
          if (!this.selectedStoreId && stores.length) {
            this.selectedStoreId = stores[0].id;
            this.setupStreams();
          }
        })
      )
      .subscribe(() => {
        this.loading = false;
      });
  }

  onStoreChange(storeId: string): void {
    this.selectedStoreId = storeId;
    this.setupStreams();
  }

  private setupStreams(): void {
    if (!this.selectedStoreId) {
      return;
    }

    const storeId = this.selectedStoreId;
    this.kpis$ = this.dashboardData.getKpis(storeId);
    this.todayTasks$ = this.dashboardData.getTodayTasks(storeId);
    this.sales$ = this.dashboardData.getSalesHistory(storeId);
    this.categories$ = this.dashboardData.getCategoryBreakdown(storeId);
  }
}
