import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { KpiMetric } from '../../shared/models/kpi.model';
import { TaskSummary } from '../../shared/models/task.model';
import { SalesRecord } from '../../shared/models/sales.model';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {
  storeName = '';
  kpis$!: Observable<KpiMetric[]>;
  tasks$!: Observable<TaskSummary[]>;
  sales$!: Observable<SalesRecord[]>;

  constructor(private readonly api: ApiService, private readonly auth: AuthService) {}

  ngOnInit(): void {
    const storeId = this.auth.currentUser?.storeId ?? this.auth.currentUser?.stores[0];
    if (!storeId) {
      return;
    }

    this.api.getStores({ userId: this.auth.currentUser?.id ?? undefined }).subscribe(stores => {
      const store = stores.find(s => s.id === storeId);
      this.storeName = store?.name ?? 'Dodijeljeni dućan';
    });

    const dashboard$ = this.api.getStoreDashboard(storeId).pipe(shareReplay(1));
    this.kpis$ = dashboard$.pipe(map(response => response.kpis));
    this.sales$ = dashboard$.pipe(map(response => response.sales));
    this.tasks$ = dashboard$.pipe(map(response => response.tasks));
  }
}
