import { Component } from '@angular/core';

interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: 'HQ Admin' | 'Regional Supervisor' | 'Store Manager';
  store?: string;
}

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent {
  readonly users: UserSummary[] = [
    { id: 'user-1', name: 'Alex Johnson', email: 'alex@retaildash.com', role: 'Regional Supervisor', store: 'East Coast' },
    { id: 'user-2', name: 'Priya Patel', email: 'priya@retaildash.com', role: 'HQ Admin' },
    { id: 'user-3', name: 'Lina Chen', email: 'lina@retaildash.com', role: 'Store Manager', store: '5th Avenue Flagship' }
  ];
}
