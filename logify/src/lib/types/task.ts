export interface Task {
    total: number;
    completed: number;
}

export interface Tasks {
    id: number;
    title: string;
    description: string;
    status: 'to-do' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    team: {
      id: number;
      name: string;
      role: string;
      avatar?: string;
    }[];
}
