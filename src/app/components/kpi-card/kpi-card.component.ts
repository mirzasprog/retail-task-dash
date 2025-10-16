import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { KpiMetric } from '../../shared/models/kpi.model';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiCardComponent implements OnDestroy {
  @Input() metric!: KpiMetric;

  private readonly currencyByStore: Record<string, string> = {
    '11111111-1111-1111-1111-111111111111': 'USD',
    '22222222-2222-2222-2222-222222222222': 'USD',
    '33333333-3333-3333-3333-333333333333': 'GBP'
  };

  private readonly metricConfiguration: Record<string, { icon: string; format: 'currency' | 'percent' | 'number' }> = {
    'daily-revenue': { icon: 'payments', format: 'currency' },
    'conversion-rate': { icon: 'donut_small', format: 'percent' },
    'avg-basket-size': { icon: 'shopping_bag', format: 'currency' }
  };

  private readonly subscription: Subscription;

  constructor(private readonly translate: TranslateService, private readonly cdr: ChangeDetectorRef) {
    this.subscription = this.translate.onLangChange.subscribe((_event: LangChangeEvent) => {
      this.cdr.markForCheck();
    });
  }

  metricKey(metric: KpiMetric): string {
    return metric.metric
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  icon(metric: KpiMetric): string {
    const key = this.metricKey(metric);
    return this.metricConfiguration[key]?.icon ?? 'insights';
  }

  formatValue(metric: KpiMetric): string {
    const key = this.metricKey(metric);
    const locale = this.translate.currentLang === 'bs' ? 'bs-BA' : 'en-US';

    if (this.metricConfiguration[key]?.format === 'currency') {
      const currency = this.currencyByStore[metric.storeId] ?? 'USD';
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(metric.value));
    }

    if (this.metricConfiguration[key]?.format === 'percent') {
      return `${Number(metric.value).toFixed(1)}%`;
    }

    return Number(metric.value).toLocaleString(locale);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
