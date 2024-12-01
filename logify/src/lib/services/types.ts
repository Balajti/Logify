export interface BaseEntity {
    id: number;
    admin_id: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface TimesheetEntry extends BaseEntity {
    team_member_id: number;
    date: string;
    hours: number;
    description?: string;
    project_id: number;
    task_id: number;
    team_member_name?: string;
    project_name?: string;
    task_title?: string;
  }
  
  export interface Project extends BaseEntity {
    name: string;
    description: string;
    status: 'not-started' | 'in-progress' | 'on-hold' | 'completed' | 'undefined';
    priority: 'low' | 'medium' | 'high';
    startDate: string;
    endDate: string;
    dueDate: string;
    progress: number;
    team: number[];
    task_total: number;
    task_completed: number;
    tasks: number[];
    team_count?: number;
    totalHours?: number;
  }
  
  export interface Task extends BaseEntity {
    title: string;
    description: string;
    status: 'to-do' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    isCompleted: boolean;
    projectId: number;
    assignedTo: number[];
  }
  
  export interface TeamMember extends BaseEntity {
    name: string;
    role?: string;
    department?: string;
    email: string;
    phone?: string;
    avatar?: string;
    status: 'active' | 'away' | 'offline';
    user_id: string;
  }

  export interface ProjectTaskHours {
    [projectName: string]: {
        [taskName: string]: number;
    };
  }
  
  export type CreateDTO<T> = Omit<T, keyof BaseEntity>;
  export type UpdateDTO<T> = Partial<CreateDTO<T>>;