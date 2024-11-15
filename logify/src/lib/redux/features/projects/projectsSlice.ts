import { mockProjects } from '@/lib/data/mockData';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  items: mockProjects,
  status: 'idle',
  error: null,
  filters: {
    status: [],
    priority: [],
    search: '',
  },
  stats: {
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
    {
      id: '3',
      type: 'timesheet',
      description: 'logged 8 hours on Project X',
      timestamp: '5 hours ago',
      user: { name: 'Mike Johnson' },
    },
    {
      id: '4',
      type: 'task',
      description: 'reviewed pull request #123',
      timestamp: 'Yesterday',
      user: { name: 'Sarah Williams' },
    },
  ],
  activeProjects: [
    1, 2, 3
  ],
};

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
    createProject: (state, action: PayloadAction<Omit<Project, 'id'>>) => {
      const newProject: Project = {
        ...action.payload,
        id: state.items.length + 1,
      };
      state.items.push(newProject);
      state.activeProjects.push(newProject.id);
    },
  },
});

export const { setFilters, updateProjectProgress, createProject } = projectsSlice.actions;
export default projectsSlice.reducer;