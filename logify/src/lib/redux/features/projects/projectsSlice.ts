// logify/src/lib/redux/features/projects/projectsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { projectsApi, tasksApi, timesheetApi, teamApi } from '@/lib/services/api';
import type { RootState } from '@/lib/redux/store';

// Type definitions
export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'on-hold' | 'completed' | 'undefined';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  dueDate: string;
  progress: number;
  team: number[];
  task: {
    total: number;
    completed: number;
  };
  tasks: number[];
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: { name: string };
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

interface ProjectsState {
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
}

const initialState: ProjectsState = {
  items: [],
  status: 'idle',
  error: null,
  filters: {
    status: [],
    priority: [],
    search: '',
  },
  dashboardStats: {
    totalHours: {
      value: 0,
      trend: { value: 0, isPositive: true },
    },
    activeProjects: {
      value: 0,
      trend: { value: 0, isPositive: true },
    },
    completedTasks: {
      value: 0,
      trend: { value: 0, isPositive: true },
    },
    teamMembers: {
      value: 0,
      trend: { value: 0, isPositive: true },
    },
  },
  timeDistribution: [],
  activities: [],
  activeProjects: [],
};

// Async Thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    const response = await projectsApi.getAll();
    if (response.status !== 200) {
      throw new Error('Failed to fetch projects');
    }
    return response.data;
  }
);

export const fetchDashboardData = createAsyncThunk(
  'projects/fetchDashboardData',
  async () => {
    const [projectsResponse, tasksResponse, timesheetResponse, teamResponse] = await Promise.all([
      projectsApi.getAll(),
      tasksApi.getAll(),
      timesheetApi.getAll(),
      teamApi.getAll(),
    ]);

    const projects = projectsResponse.data;
    const tasks = tasksResponse.data;
    const timesheetEntries = timesheetResponse.data;
    const teamMembers = teamResponse.data;

    // Calculate total hours from timesheet entries
    const totalHours = timesheetEntries.reduce((sum, entry) => sum + entry.hours, 0);

    // Calculate completed tasks
    const completedTasks = tasks.filter(task => task.status === 'completed').length;

    // Calculate active projects
    const activeProjects = projects.filter(project => project.status === 'in-progress').length;

    // Calculate team members
    const teamMembersCount = teamMembers.length;

    // Calculate time distribution
    const timeDistribution = [
      { name: 'Development', value: timesheetEntries.filter(entry => entry.description.includes('Development')).reduce((sum, entry) => sum + entry.hours, 0) },
      { name: 'Meetings', value: timesheetEntries.filter(entry => entry.description.includes('Meeting')).reduce((sum, entry) => sum + entry.hours, 0) },
      { name: 'Planning', value: timesheetEntries.filter(entry => entry.description.includes('Planning')).reduce((sum, entry) => sum + entry.hours, 0) },
      { name: 'Research', value: timesheetEntries.filter(entry => entry.description.includes('Research')).reduce((sum, entry) => sum + entry.hours, 0) },
    ];

    return {
      stats: {
        totalHours: {
          value: totalHours,
          trend: { value: 0, isPositive: true },
        },
        activeProjects: {
          value: activeProjects,
          trend: { value: 0, isPositive: true },
        },
        completedTasks: {
          value: completedTasks,
          trend: { value: 0, isPositive: true },
        },
        teamMembers: {
          value: teamMembersCount,
          trend: { value: 0, isPositive: true },
        },
      },
      timeDistribution,
      activities: [], // Add logic to fetch activities if needed
      activeProjects: projects.filter(project => project.status === 'in-progress').map(project => project.id),
    };
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProjectsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateProjectProgress: (state, action: PayloadAction<{ projectId: number; progress: number }>) => {
      const project = state.items.find(project => project.id === action.payload.projectId);
      if (project) {
        project.progress = action.payload.progress;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.dashboardStats = action.payload.stats;
        state.timeDistribution = action.payload.timeDistribution;
        state.activities = action.payload.activities;
        state.activeProjects = action.payload.activeProjects;
      })
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch projects';
      });
  },
});

// Export actions
export const {
  setFilters,
  clearFilters,
  updateProjectProgress,
} = projectsSlice.actions;

// Export selectors
export const selectAllProjects = (state: RootState) => state.projects.items;
export const selectProjectById = (state: RootState, projectId: number) =>
  state.projects.items.find(project => project.id === projectId);
export const selectDashboardStats = (state: RootState) => state.projects.dashboardStats;
export const selectTimeDistribution = (state: RootState) => state.projects.timeDistribution;
export const selectActivities = (state: RootState) => state.projects.activities;
export const selectActiveProjectIds = (state: RootState) => state.projects.activeProjects;

export default projectsSlice.reducer;