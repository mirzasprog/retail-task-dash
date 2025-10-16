import { Component } from '@angular/core';

interface StoreTaskCluster {
  id: string;
  store: string;
  city: string;
  tasksDue: number;
  critical: number;
}

@Component({
  selector: 'app-task-map-page',
  templateUrl: './task-map-page.component.html',
  styleUrls: ['./task-map-page.component.scss']
})
export class TaskMapPageComponent {
  readonly clusters: StoreTaskCluster[] = [
    { id: 'cl-1', store: '5th Avenue Flagship', city: 'New York', tasksDue: 18, critical: 3 },
    { id: 'cl-2', store: 'SoMa Tech Hub', city: 'San Francisco', tasksDue: 11, critical: 1 },
    { id: 'cl-3', store: 'Oxford Street Premier', city: 'London', tasksDue: 22, critical: 5 }
  ];
}
