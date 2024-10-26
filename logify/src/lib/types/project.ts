export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'not-started' | 'in-progress' | 'on-hold' | 'completed';
    priority: 'low' | 'medium' | 'high';
    startDate: string;
    endDate: string;
    progress: number;
    team: {
      id: string;
      name: string;
      role: string;
      avatar?: string;
    }[];
    tasks: {
      total: number;
      completed: number;
    };
  }