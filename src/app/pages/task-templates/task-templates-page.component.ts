import { Component } from '@angular/core';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  department: string;
  cadence: string;
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
      name: 'Daily Opening Checklist',
      description: 'Inventory counts, POS checks and zone walkthrough.',
      department: 'Operations',
      cadence: 'Daily'
    },
    {
      id: 'tpl-2',
      name: 'Weekly Visual Reset',
      description: 'Refresh key tables, windows and promotional zones.',
      department: 'Visual Merchandising',
      cadence: 'Weekly'
    },
    {
      id: 'tpl-3',
      name: 'Quarterly Safety Audit',
      description: 'Emergency equipment, compliance forms and signage.',
      department: 'Compliance',
      cadence: 'Quarterly'
    }
  ];
}
