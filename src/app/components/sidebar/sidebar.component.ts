import { Component } from '@angular/core';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  readonly navigation: NavigationItem[] = [
    { label: 'Dashboard', icon: 'grid_view', route: '/dashboard' },
    { label: 'Task Templates', icon: 'task_alt', route: '/tasks' },
    { label: 'Task Map', icon: 'map', route: '/task-map' },
    { label: 'Daily Sales', icon: 'leaderboard', route: '/daily-sales' },
    { label: 'Price Checker', icon: 'sell', route: '/price-checker' },
    { label: 'Admin', icon: 'settings', route: '/admin' }
  ];
}
