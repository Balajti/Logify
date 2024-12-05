import type { Task as BaseTask } from '@/lib/services/types';

export interface Task extends BaseTask {
  projectId: number;
  dueDate: string;
  assignedTo: number[];
  isCompleted: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
}

export interface TasksState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    status: string[];
    priority: string[];
    project: number[];
    search: string;
    assignedTo: number[];
  };
  stats: TaskStats;
}

export type CreateTaskInput = Omit<Task, 'id' | 'admin_id' | 'isCompleted'>;
export type UpdateTaskInput = Partial<CreateTaskInput>;