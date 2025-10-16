import { Component, Input } from '@angular/core';
import { SalesCategoryBreakdown } from '../../shared/models/sales.model';

@Component({
  selector: 'app-sales-table',
  templateUrl: './sales-table.component.html',
  styleUrls: ['./sales-table.component.scss']
})
export class SalesTableComponent {
  @Input() categories: SalesCategoryBreakdown[] = [];
}
