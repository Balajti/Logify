// src/lib/redux/features/projects/projectsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'on-hold' | 'completed';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  dueDate: string;
  progress: number;
  team: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }[];
  tasks: {
    total: number;
    completed: number;
  };
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
  activeProjects: Project[];
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
      value: '164.2',
      trend: { value: 12, isPositive: true },
    },
    activeProjects: {
      value: '12',
      trend: { value: 2, isPositive: true },
    },
    completedTasks: {
      value: '48',
      trend: { value: 8, isPositive: true },
    },
    teamMembers: {
      value: '24',
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
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Redesign the company website with modern UI/UX',
      status: 'in-progress',
      priority: 'high',
      startDate: '2024-10-01',
      endDate: '2024-11-30',
      dueDate: 'Nov 30',
      progress: 75,
      team: [
        { id: '1', name: 'John Doe', role: 'Lead Designer' },
        { id: '2', name: 'Jane Smith', role: 'Developer' },
      ],
      tasks: { total: 20, completed: 15 },
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Develop a new mobile app for customers',
      status: 'in-progress',
      priority: 'high',
      startDate: '2024-09-15',
      endDate: '2024-12-15',
      dueDate: 'Dec 15',
      progress: 45,
      team: [
        { id: '3', name: 'Mike Johnson', role: 'Mobile Developer' },
        { id: '4', name: 'Sarah Williams', role: 'UX Designer' },
      ],
      tasks: { total: 30, completed: 12 },
    },
    {
      id: '3',
      name: 'API Integration',
      description: 'Integrate third-party APIs',
      status: 'in-progress',
      priority: 'medium',
      startDate: '2024-10-15',
      endDate: '2024-11-25',
      dueDate: 'Nov 25',
      progress: 90,
      team: [
        { id: '5', name: 'Alex Brown', role: 'Backend Developer' },
      ],
      tasks: { total: 15, completed: 13 },
    },
  ],
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProjectsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateProjectProgress: (state, action: PayloadAction<{ projectId: string; progress: number }>) => {
      const project = state.items.find(p => p.id === action.payload.projectId);
      if (project) {
        project.progress = action.payload.progress;
      }
    },
    createProject: (state, action: PayloadAction<Omit<Project, 'id'>>) => {
      const newProject: Project = {
        ...action.payload,
        id: `project-${state.items.length + 1}`,
      };
      state.items.push(newProject);
      state.activeProjects.push(newProject);
    },
  },
});

export const { setFilters, updateProjectProgress, createProject } = projectsSlice.actions;
export default projectsSlice.reducer;