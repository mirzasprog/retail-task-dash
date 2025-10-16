import { Component } from '@angular/core';

interface NavigationItem {
  labelKey: string;
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
    { labelKey: 'navigation.dashboard', icon: 'grid_view', route: '/dashboard' },
    { labelKey: 'navigation.taskTemplates', icon: 'task_alt', route: '/tasks' },
    { labelKey: 'navigation.taskMap', icon: 'map', route: '/task-map' },
    { labelKey: 'navigation.dailySales', icon: 'leaderboard', route: '/daily-sales' },
    { labelKey: 'navigation.priceChecker', icon: 'sell', route: '/price-checker' },
    { labelKey: 'navigation.admin', icon: 'settings', route: '/admin' }
  ];
}
