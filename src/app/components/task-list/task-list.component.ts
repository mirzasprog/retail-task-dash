import { Component, Input } from '@angular/core';
import { TaskSummary } from '../../shared/models/task.model';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  @Input() title = 'Tasks';
  @Input() tasks: TaskSummary[] = [];
}
