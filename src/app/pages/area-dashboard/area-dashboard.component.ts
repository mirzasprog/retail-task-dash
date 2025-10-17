import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { KpiMetric } from '../../shared/models/kpi.model';
import { SalesRecord } from '../../shared/models/sales.model';
import { StoreSummary } from '../../shared/models/store.model';
import { TaskSummary } from '../../shared/models/task.model';

@Component({
  selector: 'app-area-dashboard',
  templateUrl: './area-dashboard.component.html',
  styleUrls: ['./area-dashboard.component.scss']
})
export class AreaDashboardComponent {
  stores: StoreSummary[] = [];
  selectedStoreId: string | null = null;

  kpis$!: Observable<KpiMetric[]>;
  sales$!: Observable<SalesRecord[]>;
  tasks$!: Observable<TaskSummary[]>;
  private dashboard$!: Observable<{ kpis: KpiMetric[]; sales: SalesRecord[]; tasks: TaskSummary[] }>;

  constructor(private readonly api: ApiService, private readonly auth: AuthService) {
    const user = this.auth.currentUser;
    if (user) {
      this.api
        .getStores({ userId: user.id })
        .pipe(
          tap(stores => {
            this.stores = stores;
            this.selectedStoreId = stores[0]?.id ?? null;
            if (this.selectedStoreId) {
              this.loadStore(this.selectedStoreId);
            }
          })
        )
        .subscribe();
    }
  }

  onStoreChange(storeId: string): void {
    this.selectedStoreId = storeId;
    this.loadStore(storeId);
  }

  private loadStore(storeId: string): void {
    this.dashboard$ = this.api.getStoreDashboard(storeId).pipe(shareReplay(1));
    this.kpis$ = this.dashboard$.pipe(map(response => response.kpis));
    this.sales$ = this.dashboard$.pipe(map(response => response.sales));
    this.tasks$ = this.dashboard$.pipe(map(response => response.tasks));
  }
}
