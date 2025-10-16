import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { SalesCategoryBreakdown } from '../../shared/models/sales.model';

@Component({
  selector: 'app-sales-table',
  templateUrl: './sales-table.component.html',
  styleUrls: ['./sales-table.component.scss']
})
export class SalesTableComponent {
  @Input() categories: SalesCategoryBreakdown[] = [];

  private readonly currencyByStore: Record<string, string> = {
    '11111111-1111-1111-1111-111111111111': 'USD',
    '22222222-2222-2222-2222-222222222222': 'USD',
    '33333333-3333-3333-3333-333333333333': 'GBP'
  };

  constructor(private readonly translate: TranslateService) {}

  formatSales(category: SalesCategoryBreakdown): string {
    const locale = this.translate.currentLang === 'bs' ? 'bs-BA' : 'en-US';
    const currency = this.currencyByStore[category.storeId] ?? 'USD';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(category.sales));
  }
}
