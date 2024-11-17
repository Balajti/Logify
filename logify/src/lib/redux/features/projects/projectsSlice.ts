// lib/redux/features/projects/projectsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

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

// Initial state
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
      value: 164.2,
      trend: { value: 12, isPositive: true },
    },
    activeProjects: {
      value: 12,
      trend: { value: 2, isPositive: true },
    },
    completedTasks: {
      value: 48,
      trend: { value: 8, isPositive: true },
    },
    teamMembers: {
      value: 24,
      trend: { value: 3, isPositive: true },
    },
  },
  timeDistribution: [
    { name: 'Development', value: 45 },
    { name: 'Meetings', value: 20 },
    { name: 'Planning', value: 15 },
    { name: 'Research', value: 20 },
  ],
  activities: [
    {
      id: '1',
      type: 'task',
      description: 'completed the login page design',
      timestamp: '2 hours ago',
      user: { name: 'John Doe' },
    },
    {
      id: '2',
      type: 'project',
      description: 'started working on the API integration',
      timestamp: '3 hours ago',
      user: { name: 'Jane Smith' },
    },
  ],
  activeProjects: [1, 2, 3],
};

// Async thunks
const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    const data = await response.json();
    return data;
  }
);

const createProjectAsync = createAsyncThunk(
  'projects/createProject',
  async (projectData: Omit<Project, 'id'>) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    const data = await response.json();
    return data;
  }
);

const updateProjectAsync = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: number; data: Partial<Project> }) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    const updatedProject = await response.json();
    return updatedProject;
  }
);

const deleteProjectAsync = createAsyncThunk(
  'projects/deleteProject',
  async (id: number) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
    return id;
  }
);

export const fetchDashboardData = createAsyncThunk(
  'projects/fetchDashboardData',
  async () => {
    const response = await fetch('/api/dashboard');
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    return await response.json();
  }
);

// Slice
const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Regular reducers (synchronous actions)
    setFilters(state, action: PayloadAction<Partial<ProjectsState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = initialState.filters;
    },
    updateProjectProgress(state, action: PayloadAction<{ projectId: number; progress: number }>) {
      const project = state.items.find(p => p.id === action.payload.projectId);
      if (project) {
        project.progress = action.payload.progress;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch projects
    builder
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.dashboardStats = action.payload.stats;
        state.timeDistribution = action.payload.timeDistribution;
        state.activities = action.payload.activities;
        state.activeProjects = action.payload.activeProjects;
      });
    
    builder
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
    
    // Create project
    builder
      .addCase(createProjectAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProjectAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createProjectAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create project';
      })
    
    // Update project
    builder
      .addCase(updateProjectAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(project => project.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
    
    // Delete project
    builder
      .addCase(deleteProjectAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(project => project.id !== action.payload);
      });
  },
});

// Export actions
export const {
  setFilters,
  clearFilters,
  updateProjectProgress,
} = projectsSlice.actions;

export {
  fetchProjects,
  createProjectAsync,
  updateProjectAsync,
  deleteProjectAsync,
};

// Export selectors
export const selectAllProjects = (state: RootState) => state.projects.items;
export const selectProjectById = (state: RootState, projectId: number) => 
  state.projects.items.find(project => project.id === projectId);
export const selectProjectsStatus = (state: RootState) => state.projects.status;
export const selectProjectsError = (state: RootState) => state.projects.error;
export const selectProjectFilters = (state: RootState) => state.projects.filters;

export const selectDashboardStats = (state: RootState) => state.projects.dashboardStats;
export const selectTimeDistribution = (state: RootState) => state.projects.timeDistribution;
export const selectActivities = (state: RootState) => state.projects.activities;
export const selectActiveProjectIds = (state: RootState) => state.projects.activeProjects;

export const selectFilteredProjects = (state: RootState) => {
  const { items, filters } = state.projects;
  
  return items.filter(project => {
    if (filters.status.length && !filters.status.includes(project.status)) return false;
    if (filters.priority.length && !filters.priority.includes(project.priority)) return false;
    if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
};

// Export reducer
export default projectsSlice.reducer;