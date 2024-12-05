import type { TimesheetEntry as BaseTimesheetEntry } from '@/lib/services/types';

export interface TimesheetEntry extends BaseTimesheetEntry {
  task_title?: string;
  project_name?: string;
}

export interface ProjectDistribution {
  project_id: number;
  hours: number;
  percentage: number;
}

export interface TimesheetSummary {
  totalHours: number;
  dailyAverage: number;
  weeklyTotal: number;
  monthlyTotal: number;
  projectDistribution: ProjectDistribution[];
}

export interface TimesheetState {
  entries: TimesheetEntry[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    startDate: string | null;
    endDate: string | null;
    team_member_id: number | null;
    project_id: number | null;
    task_id: number | null;
  };
  summary: TimesheetSummary;
  selectedEntry: TimesheetEntry | null;
  selectedEmployee: number | null;
}

export type CreateTimesheetEntryInput = Omit<TimesheetEntry, 'id' | 'admin_id' | 'created_at' | 'task_title' | 'project_name'>;
export type UpdateTimesheetEntryInput = Partial<CreateTimesheetEntryInput>;