import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface DailySalesMetric {
  id: string;
  store: string;
  revenue: number;
  transactions: number;
  conversion: number;
}

@Component({
  selector: 'app-daily-sales-page',
  templateUrl: './daily-sales-page.component.html',
  styleUrls: ['./daily-sales-page.component.scss']
})
export class DailySalesPageComponent {
  readonly metrics: DailySalesMetric[] = [
    { id: 'ds-1', store: '5th Avenue Flagship', revenue: 128450, transactions: 1498, conversion: 6.4 },
    { id: 'ds-2', store: 'SoMa Tech Hub', revenue: 86120, transactions: 987, conversion: 4.9 },
    { id: 'ds-3', store: 'Oxford Street Premier', revenue: 96020, transactions: 1156, conversion: 5.7 }
  ];

  private readonly currencyByStore: Record<string, string> = {
    '5th Avenue Flagship': 'USD',
    'SoMa Tech Hub': 'USD',
    'Oxford Street Premier': 'GBP'
  };

  constructor(private readonly translate: TranslateService) {}

  formatRevenue(metric: DailySalesMetric): string {
    const locale = this.translate.currentLang === 'bs' ? 'bs-BA' : 'en-US';
    const currency = this.currencyByStore[metric.store] ?? 'USD';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(metric.revenue);
  }
}
