export interface TaskSummary {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignedTo?: string;
}
