import { Component } from '@angular/core';

interface UserSummary {
  id: string;
  name: string;
  email: string;
  roleKey: 'hqAdmin' | 'regionalSupervisor' | 'storeManager';
  store?: string;
}

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent {
  readonly users: UserSummary[] = [
    { id: 'user-1', name: 'Alex Johnson', email: 'alex@retaildash.com', roleKey: 'regionalSupervisor', store: 'East Coast' },
    { id: 'user-2', name: 'Priya Patel', email: 'priya@retaildash.com', roleKey: 'hqAdmin' },
    { id: 'user-3', name: 'Lina Chen', email: 'lina@retaildash.com', roleKey: 'storeManager', store: '5th Avenue Flagship' }
  ];
}
