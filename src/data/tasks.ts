import { Personnel } from './personnel';

export interface Task {
  id: string;
  name: string;
  description: string; // HTML content from rich text editor
  relatedService: {
    projectId: string;
    projectName: string;
  };
  assigner: Personnel;
  assignee: Personnel;
  deadline: string; // ISO string date
  priority: 'Gấp' | 'Cao' | 'Bình thường';
  status: 'Chưa làm' | 'Đang làm' | 'Hoàn thành';
}

export const initialTasks: Task[] = [];