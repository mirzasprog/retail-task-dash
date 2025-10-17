import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { KpiMetric } from '../../shared/models/kpi.model';
import { SalesRecord } from '../../shared/models/sales.model';
import { StoreSummary } from '../../shared/models/store.model';

@Component({
  selector: 'app-regional-dashboard',
  templateUrl: './regional-dashboard.component.html',
  styleUrls: ['./regional-dashboard.component.scss']
})
export class RegionalDashboardComponent {
  stores: StoreSummary[] = [];
  selectedStoreId: string | null = null;

  regionKpis$!: Observable<KpiMetric[]>;
  regionSales$!: Observable<SalesRecord[]>;
  storeKpis$!: Observable<KpiMetric[]>;
  storeSales$!: Observable<SalesRecord[]>;
  private storeDashboard$!: Observable<{ kpis: KpiMetric[]; sales: SalesRecord[] }>;

  constructor(private readonly api: ApiService, private readonly auth: AuthService) {
    const regionId = this.auth.currentUser?.regionId;
    if (regionId) {
      this.api
        .getStores({ regionId })
        .pipe(
          tap(stores => {
            this.stores = stores;
            this.selectedStoreId = stores[0]?.id ?? null;
            if (this.selectedStoreId) {
              this.loadStoreData(this.selectedStoreId);
            }
          })
        )
        .subscribe();
      this.regionKpis$ = this.api.getRegionKpis(regionId);
      this.regionSales$ = this.api.getRegionSales(regionId);
    }
  }

  onStoreChange(storeId: string): void {
    this.selectedStoreId = storeId;
    this.loadStoreData(storeId);
  }

  private loadStoreData(storeId: string): void {
    this.storeDashboard$ = this.api.getStoreDashboard(storeId).pipe(shareReplay(1));
    this.storeKpis$ = this.storeDashboard$.pipe(map(response => response.kpis));
    this.storeSales$ = this.storeDashboard$.pipe(map(response => response.sales));
  }
}
