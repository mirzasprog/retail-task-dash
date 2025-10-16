import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { SalesRecord } from '../../shared/models/sales.model';

@Component({
  selector: 'app-trend-chart',
  templateUrl: './trend-chart.component.html',
  styleUrls: ['./trend-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendChartComponent implements OnDestroy {
  @Input() sales: SalesRecord[] = [];

  private readonly currencyByStore: Record<string, string> = {
    '11111111-1111-1111-1111-111111111111': 'USD',
    '22222222-2222-2222-2222-222222222222': 'USD',
    '33333333-3333-3333-3333-333333333333': 'GBP'
  };

  private readonly subscription: Subscription;

  constructor(private readonly translate: TranslateService, private readonly cdr: ChangeDetectorRef) {
    this.subscription = this.translate.onLangChange.subscribe((_event: LangChangeEvent) => {
      this.cdr.markForCheck();
    });
  }

  formatSales(record: SalesRecord): string {
    const locale = this.translate.currentLang === 'bs' ? 'bs-BA' : 'en-US';
    const currency = this.currencyByStore[record.storeId] ?? 'USD';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(record.sales));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
