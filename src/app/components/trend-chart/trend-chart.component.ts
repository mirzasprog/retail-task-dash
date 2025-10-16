import { Component, Input } from '@angular/core';
import { SalesRecord } from '../../shared/models/sales.model';

@Component({
  selector: 'app-trend-chart',
  templateUrl: './trend-chart.component.html',
  styleUrls: ['./trend-chart.component.scss']
})
export class TrendChartComponent {
  @Input() sales: SalesRecord[] = [];
}
