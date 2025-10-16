export interface TaskSummary {
  id: string;
  storeId: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignedTo?: string;
}
