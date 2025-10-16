import { Component } from '@angular/core';

interface TaskTemplate {
  id: string;
  nameKey: string;
  descriptionKey: string;
  departmentKey: string;
  cadenceKey: string;
}

@Component({
  selector: 'app-task-templates-page',
  templateUrl: './task-templates-page.component.html',
  styleUrls: ['./task-templates-page.component.scss']
})
export class TaskTemplatesPageComponent {
  readonly templates: TaskTemplate[] = [
    {
      id: 'tpl-1',
      nameKey: 'taskTemplates.templates.dailyOpening.name',
      descriptionKey: 'taskTemplates.templates.dailyOpening.description',
      departmentKey: 'taskTemplates.templates.dailyOpening.department',
      cadenceKey: 'taskTemplates.templates.dailyOpening.cadence'
    },
    {
      id: 'tpl-2',
      nameKey: 'taskTemplates.templates.weeklyVisual.name',
      descriptionKey: 'taskTemplates.templates.weeklyVisual.description',
      departmentKey: 'taskTemplates.templates.weeklyVisual.department',
      cadenceKey: 'taskTemplates.templates.weeklyVisual.cadence'
    },
    {
      id: 'tpl-3',
      nameKey: 'taskTemplates.templates.quarterlySafety.name',
      descriptionKey: 'taskTemplates.templates.quarterlySafety.description',
      departmentKey: 'taskTemplates.templates.quarterlySafety.department',
      cadenceKey: 'taskTemplates.templates.quarterlySafety.cadence'
    }
  ];
}
