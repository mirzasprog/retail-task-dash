import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { TaskSummary } from '../../shared/models/task.model';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  @Input() title = '';
  @Input() tasks: TaskSummary[] = [];

  constructor(public readonly translate: TranslateService) {}

  get currentLocale(): string {
    return this.translate.currentLang === 'bs' ? 'bs-BA' : 'en-US';
  }
}
