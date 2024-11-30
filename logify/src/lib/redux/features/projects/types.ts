import type { Project, TimesheetEntry } from '@/lib/services/types';

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

export interface TimeDistributionData {
  name: string;
  value: number;
}

export interface DashboardStats {
  totalHours: {
    value: number;
    trend: { value: number; isPositive: boolean };
  };
  activeProjects: {
    value: number;
    trend: { value: number; isPositive: boolean };
  };
  completedTasks: {
    value: number;
    trend: { value: number; isPositive: boolean };
  };
  teamMembers: {
    value: number;
    trend: { value: number; isPositive: boolean };
  };
}

export interface ProjectsState {
  items: Project[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    status: string[];
    priority: string[];
    search: string;
  };
  dashboardStats: DashboardStats;
  timeDistribution: TimeDistributionData[];
  activities: Activity[];
  activeProjects: number[];
  overdueTasks: number;
}

// Re-export types that are needed by components
export type { Project, TimesheetEntry };