import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StoreSummary } from '../../shared/models/store.model';

@Component({
  selector: 'app-store-select',
  templateUrl: './store-select.component.html',
  styleUrls: ['./store-select.component.scss']
})
export class StoreSelectComponent {
  @Input() stores: StoreSummary[] = [];
  @Input() selectedStoreId: string | null = null;
  @Output() selectedStoreChange = new EventEmitter<string>();

  onSelect(value: string): void {
    this.selectedStoreChange.emit(value);
  }
}
