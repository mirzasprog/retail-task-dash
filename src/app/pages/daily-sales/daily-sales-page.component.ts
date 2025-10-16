import { Component } from '@angular/core';

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
}
