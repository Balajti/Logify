// app/lib/features/projects/projectsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { projectsApi } from '@/lib/services/api';

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

interface Activity {
  id: string;
  type: 'task' | 'project' | 'timesheet';
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
}

interface TimeDistributionData {
  name: string;
  value: number;
}

interface Stats {
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
  stats: Stats;
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
  stats: {
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
  timeDistribution: [
    { name: 'Development', value: 0 },
    { name: 'Meetings', value: 0 },
    { name: 'Planning', value: 0 },
    { name: 'Research', value: 0 },
  ],
  activities: [],
  activeProjects: [],
};

// Async Thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectsApi.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch projects');
    }
  }
);

export const createProjectAsync = createAsyncThunk(
  'projects/createProject',
  async (projectData: Omit<Project, 'id'>, { rejectWithValue }) => {
    try {
      const response = await projectsApi.create(projectData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create project');
    }
  }
);

export const updateProjectAsync = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: number; data: Partial<Project> }, { rejectWithValue }) => {
    try {
      const response = await projectsApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update project');
    }
  }
);

export const deleteProjectAsync = createAsyncThunk(
  'projects/deleteProject',
  async (id: number, { rejectWithValue }) => {
    try {
      await projectsApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete project');
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProjectsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateProjectProgress: (state, action: PayloadAction<{ projectId: number; progress: number }>) => {
      const project = state.items.find(p => p.id === action.payload.projectId);
      if (project) {
        project.progress = action.payload.progress;
      }
    },
    // Local actions for optimistic updates
    setStatus: (state, action: PayloadAction<ProjectsState['status']>) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateStats: (state, action: PayloadAction<Partial<Stats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.activeProjects = action.payload
          .filter((p: Project) => p.status === 'in-progress')
          .map((p: Project) => p.id);
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create project
      .addCase(createProjectAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProjectAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
        if (action.payload.status === 'in-progress') {
          state.activeProjects.push(action.payload.id);
        }
      })
      .addCase(createProjectAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Update project
      .addCase(updateProjectAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProjectAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          // Update activeProjects if status changed
          const isActive = action.payload.status === 'in-progress';
          const activeIndex = state.activeProjects.indexOf(action.payload.id);
          if (isActive && activeIndex === -1) {
            state.activeProjects.push(action.payload.id);
          } else if (!isActive && activeIndex !== -1) {
            state.activeProjects.splice(activeIndex, 1);
          }
        }
      })
      .addCase(updateProjectAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Delete project
      .addCase(deleteProjectAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteProjectAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(p => p.id !== action.payload);
        state.activeProjects = state.activeProjects.filter(id => id !== action.payload);
      })
      .addCase(deleteProjectAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setFilters,
  updateProjectProgress,
  setStatus,
  setError,
  updateStats,
} = projectsSlice.actions;

// Export reducer
export default projectsSlice.reducer;

// Selectors
export const selectAllProjects = (state: { projects: ProjectsState }) => state.projects.items;
export const selectProjectById = (state: { projects: ProjectsState }, projectId: number) => 
  state.projects.items.find(p => p.id === projectId);
export const selectProjectsStatus = (state: { projects: ProjectsState }) => state.projects.status;
export const selectProjectsError = (state: { projects: ProjectsState }) => state.projects.error;
export const selectProjectFilters = (state: { projects: ProjectsState }) => state.projects.filters;
export const selectActiveProjects = (state: { projects: ProjectsState }) => 
  state.projects.items.filter(p => state.projects.activeProjects.includes(p.id));

// Filtered projects selector
export const selectFilteredProjects = (state: { projects: ProjectsState }) => {
  const { items, filters } = state.projects;
  
  return items.filter(project => {
    if (filters.status.length && !filters.status.includes(project.status)) return false;
    if (filters.priority.length && !filters.priority.includes(project.priority)) return false;
    if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
};