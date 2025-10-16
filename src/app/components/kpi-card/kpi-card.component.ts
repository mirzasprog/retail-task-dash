import { Component, Input } from '@angular/core';
import { KpiMetric } from '../../shared/models/kpi.model';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss']
})
export class KpiCardComponent {
  @Input() metric!: KpiMetric;
}
