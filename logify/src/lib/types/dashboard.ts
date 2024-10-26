export interface Project {
    id: string;
    name: string;
    progress: number;
    status: 'on-track' | 'at-risk' | 'delayed';
    dueDate: string;
  }
  
  export interface Activity {
    id: string;
    type: 'task' | 'project' | 'timesheet';
    description: string;
    timestamp: string;
    user: {
      name: string;
      avatar?: string;
    };
  }
  
  export interface Stats {
    totalHours: {
      value: string;
      trend: { value: number; isPositive: boolean };
    };
    activeProjects: {
      value: string;
      trend: { value: number; isPositive: boolean };
    };
    completedTasks: {
      value: string;
      trend: { value: number; isPositive: boolean };
    };
    teamMembers: {
      value: string;
      trend: { value: number; isPositive: boolean };
    };
  }
  
  export interface TimeDistributionData {
    name: string;
    value: number;
  }
  
  export interface DashboardData {
    stats: Stats;
    timeDistribution: TimeDistributionData[];
    activities: Activity[];
    activeProjects: Project[];
  }