import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ApiService } from '../../core/services/api.service';
import { HqOverview, RegionSummary } from '../../shared/models/reporting.model';

@Component({
  selector: 'app-hq-dashboard',
  templateUrl: './hq-dashboard.component.html',
  styleUrls: ['./hq-dashboard.component.scss']
})
export class HqDashboardComponent {
  overview$!: Observable<HqOverview>;
  selectedRegion: RegionSummary | null = null;
  readonly filterForm = this.fb.group({
    startDate: [''],
    endDate: ['']
  });

  constructor(private readonly api: ApiService, private readonly fb: FormBuilder) {
    this.loadOverview();
  }

  loadOverview(): void {
    const { startDate, endDate } = this.filterForm.value;
    this.overview$ = this.api.getHqOverview(startDate ?? undefined, endDate ?? undefined).pipe(
      tap(overview => {
        this.selectedRegion = overview.regions[0] ?? null;
      })
    );
  }

  selectRegion(region: RegionSummary): void {
    this.selectedRegion = region;
  }

  export(): void {
    const { startDate, endDate } = this.filterForm.value;
    this.api.exportHqOverview(startDate ?? undefined, endDate ?? undefined).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hq-overview.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
