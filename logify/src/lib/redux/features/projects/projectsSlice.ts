import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { projectsApi, tasksApi, timesheetApi, teamApi } from '@/lib/services/api';
import type { RootState } from '@/lib/redux/store';
import type { CreateDTO } from '@/lib/services/types';
import type {
  Project,
  TimesheetEntry,
  ProjectsState,
  TimeDistributionData,
} from './types';

// Async Thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const session = state.auth.session;

    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    const response = await projectsApi.getAll({
      admin_id: session.user.admin_id || session.user.id
    });

    return response.data;
  }
);

export const fetchDashboardData = createAsyncThunk(
  'projects/fetchDashboardData',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const session = state.auth.session;

    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    const params = {
      admin_id: session.user.admin_id || session.user.id
    };

    const [projectsResponse, tasksResponse, timesheetResponse, teamResponse] = await Promise.all([
      projectsApi.getAll(params),
      tasksApi.getAll(params),
      timesheetApi.getAll(params),
      teamApi.getAll(params),
    ]);

    const projects = projectsResponse.data;
    const tasks = tasksResponse.data;
    const timesheetEntries = timesheetResponse.data;
    const teamMembers = teamResponse.data;

    const calculateTimeDistribution = (entries: TimesheetEntry[], category: string): number => {
      return Math.round(
        entries
          .filter(entry => entry.description?.includes(category))
          .reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0)
      );
    };

    const timeDistribution: TimeDistributionData[] = [
      { name: 'Development', value: calculateTimeDistribution(timesheetEntries, 'Development') },
      { name: 'Meetings', value: calculateTimeDistribution(timesheetEntries, 'Meeting') },
      { name: 'Planning', value: calculateTimeDistribution(timesheetEntries, 'Planning') },
      { name: 'Research', value: calculateTimeDistribution(timesheetEntries, 'Research') },
    ];

    return {
      stats: {
        totalHours: {
          value: Math.round(timesheetEntries.reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0)),
          trend: { value: 0, isPositive: true },
        },
        activeProjects: {
          value: projects.filter(project => project.status === 'in-progress').length,
          trend: { value: 0, isPositive: true },
        },
        completedTasks: {
          value: tasks.filter(task => task.status === 'completed').length,
          trend: { value: 0, isPositive: true },
        },
        teamMembers: {
          value: teamMembers.length,
          trend: { value: 0, isPositive: true },
        },
      },
      timeDistribution,
      activities: [],
      activeProjects: projects
        .filter(project => project.status === 'in-progress')
        .map(project => project.id),
      overdueTasks: projects.filter(project => project.status === 'not-started').length,
    };
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: CreateDTO<Project>, { getState }) => {
    const state = getState() as RootState;
    const session = state.auth.session;

    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    const response = await projectsApi.create(projectData);
    return response.data;
  }
);

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
  overdueTasks: 0,
};

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
        state.overdueTasks = action.payload.overdueTasks;
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
      })
      .addCase(createProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create project';
      });
  },
});

export const {
  setFilters,
  clearFilters,
  updateProjectProgress,
} = projectsSlice.actions;

// Selectors
export const selectAllProjects = (state: RootState) => state.projects.items;
export const selectProjectById = (state: RootState, projectId: number) =>
  state.projects.items.find(project => project.id === projectId);
export const selectDashboardStats = (state: RootState) => state.projects.dashboardStats;
export const selectTimeDistribution = (state: RootState) => state.projects.timeDistribution;
export const selectActivities = (state: RootState) => state.projects.activities;
export const selectActiveProjectIds = (state: RootState) => state.projects.activeProjects;

export default projectsSlice.reducer;