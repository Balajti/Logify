import { Task, Tasks } from "./task";

export interface Project {
    id: number;
    name: string;
    description: string;
    status: 'not-started' | 'in-progress' | 'on-hold' | 'completed';
    priority: 'low' | 'medium' | 'high';
    startDate: string;
    endDate: string;
    progress: number;
    team: {
      id: number;
      name: string;
      role: string;
      avatar?: string;
    }[];
    tasks: Task;
    task: Tasks[];
  }