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
    team: number[];
    isCompleted: boolean,
    projectId: number;
}
