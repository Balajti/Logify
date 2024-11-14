// src/lib/redux/features/projects/projectsSlice.ts
import { Tasks } from '@/lib/types/task';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Project {
  id: number;
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
  task: Tasks[];
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
  items: [
    {
      id: 1,
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
      task: [
        { id: 1, title: 'Homepage Design', description: 'Design the homepage layout', status: 'completed', priority: 'high', dueDate: 'Oct 15', team: [{ id: 1, name: 'John Doe', role: 'Lead Designer' }] },
        { id: 2, title: 'About Page Design', description: 'Design the about page layout', status: 'in-progress', priority: 'medium', dueDate: 'Oct 25', team: [{ id: 2, name: 'Jane Smith', role: 'Developer' }] },
        { id: 3, title: 'Contact Page Design', description: 'Design the contact page layout', status: 'to-do', priority: 'low', dueDate: 'Nov 05', team: [{ id: 1, name: 'John Doe', role: 'Lead Designer' }] },
      ]
    },
    {
      id: 2,
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
      task: [
        { id: 1, title: 'Wireframes', description: 'Create wireframes for the app', status: 'completed', priority: 'high', dueDate: 'Sep 30', team: [{ id: 4, name: 'Sarah Williams', role: 'UX Designer' }] },
        { id: 2, title: 'Prototype', description: 'Develop a prototype for the app', status: 'in-progress', priority: 'medium', dueDate: 'Oct 15', team: [{ id: 3, name: 'Mike Johnson', role: 'Mobile Developer' }] },
        { id: 3, title: 'Testing', description: 'Perform user testing on the app', status: 'to-do', priority: 'low', dueDate: 'Nov 15', team: [{ id: 3, name: 'Mike Johnson', role: 'Mobile Developer' }] },
        { id: 4, title: 'Launch', description: 'Launch the app on app stores', status: 'to-do', priority: 'medium', dueDate: 'Dec 15', team: [{ id: 3, name: 'Mike Johnson', role: 'Mobile Developer' }] },
      ]
    },
    {
      id: 3,
      name: 'API Integration',
      description: 'Integrate third-party APIs',
      status: 'not-started',
      priority: 'medium',
      startDate: '2024-10-15',
      endDate: '2024-11-25',
      dueDate: 'Nov 25',
      progress: 0,
      team: [
        { id: '5', name: 'Alex Brown', role: 'Backend Developer' },
      ],
      tasks: { total: 15, completed: 0 },
      task: [
        { id: 1, title: 'Research APIs', description: 'Research available APIs for integration', status: 'to-do', priority: 'low', dueDate: 'Oct 25', team: [{ id: 5, name: 'Alex Brown', role: 'Backend Developer' }] },
        { id: 2, title: 'Design Architecture', description: 'Design the architecture for API integration', status: 'to-do', priority: 'medium', dueDate: 'Nov 05', team: [{ id: 5, name: 'Alex Brown', role: 'Backend Developer' }] },
        { id: 3, title: 'Develop API Endpoints', description: 'Develop API endpoints for integration', status: 'to-do', priority: 'high', dueDate: 'Nov 15', team: [{ id: 5, name: 'Alex Brown', role: 'Backend Developer' }] },
        { id: 4, title: 'Testing', description: 'Perform testing on API integration', status: 'to-do', priority: 'medium', dueDate: 'Nov 25', team: [{ id: 5, name: 'Alex Brown', role: 'Backend Developer' }] },
      ]
    },
    {
      id: 4,
      name: 'Data Analytics Dashboard',
      description: 'Create a comprehensive analytics dashboard',
      status: 'completed',
      priority: 'low',
      startDate: '2024-08-01',
      endDate: '2024-09-30',
      dueDate: 'Sep 30',
      progress: 100,
      team: [
        { id: '6', name: 'Emily Chen', role: 'Data Scientist' },
        { id: '7', name: 'Tom Wilson', role: 'Frontend Developer' },
      ],
      tasks: { total: 25, completed: 25 },
      task: [
        { id: 1, title: 'Data Collection', description: 'Collect data from various sources', status: 'completed', priority: 'high', dueDate: 'Aug 15', team: [{ id: 6, name: 'Emily Chen', role: 'Data Scientist' }] },
        { id: 2, title: 'Data Processing', description: 'Process and clean the collected data', status: 'completed', priority: 'high', dueDate: 'Aug 30', team: [{ id: 6, name: 'Emily Chen', role: 'Data Scientist' }] },
        { id: 3, title: 'Dashboard Design', description: 'Design the analytics dashboard UI', status: 'completed', priority: 'medium', dueDate: 'Sep 15', team: [{ id: 7, name: 'Tom Wilson', role: 'Frontend Developer' }] },
        { id: 4, title: 'Dashboard Development', description: 'Develop the analytics dashboard', status: 'completed', priority: 'medium', dueDate: 'Sep 30', team: [{ id: 7, name: 'Tom Wilson', role: 'Frontend Developer' }] },
      ]
    }
  ],
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
      id: 1,
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
      tasks: { total: 3, completed: 1 },
      task: [
        { id: 1, title: 'Homepage Design', description: 'Design the homepage layout', status: 'completed', priority: 'high', dueDate: 'Oct 15', team: [{ id: 1, name: 'John Doe', role: 'Lead Designer' }] },
        { id: 2, title: 'About Page Design', description: 'Design the about page layout', status: 'in-progress', priority: 'medium', dueDate: 'Oct 25', team: [{ id: 2, name: 'Jane Smith', role: 'Developer' }] },
        { id: 3, title: 'Contact Page Design', description: 'Design the contact page layout', status: 'to-do', priority: 'low', dueDate: 'Nov 05', team: [{ id: 1, name: 'John Doe', role: 'Lead Designer' }] },
      ]
    },
    {
      id: 2,
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
      tasks: { total: 4, completed: 1 },
      task: [
        { id: 1, title: 'Wireframes', description: 'Create wireframes for the app', status: 'completed', priority: 'high', dueDate: 'Sep 30', team: [{ id: 4, name: 'Sarah Williams', role: 'UX Designer' }] },
        { id: 2, title: 'Prototype', description: 'Develop a prototype for the app', status: 'in-progress', priority: 'medium', dueDate: 'Oct 15', team: [{ id: 3, name: 'Mike Johnson', role: 'Mobile Developer' }] },
        { id: 3, title: 'Testing', description: 'Perform user testing on the app', status: 'to-do', priority: 'low', dueDate: 'Nov 15', team: [{ id: 3, name: 'Mike Johnson', role: 'Mobile Developer' }] },
        { id: 4, title: 'Launch', description: 'Launch the app on app stores', status: 'to-do', priority: 'medium', dueDate: 'Dec 15', team: [{ id: 3, name: 'Mike Johnson', role: 'Mobile Developer' }] },
      ]
    },
    {
      id: 3,
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
      tasks: { total: 4, completed: 0 },
      task: [
        { id: 1, title: 'Research APIs', description: 'Research available APIs for integration', status: 'to-do', priority: 'low', dueDate: 'Oct 25', team: [{ id: 5, name: 'Alex Brown', role: 'Backend Developer' }] },
        { id: 2, title: 'Design Architecture', description: 'Design the architecture for API integration', status: 'to-do', priority: 'medium', dueDate: 'Nov 05', team: [{ id: 5, name: 'Alex Brown', role: 'Backend Developer' }] },
        { id: 3, title: 'Develop API Endpoints', description: 'Develop API endpoints for integration', status: 'to-do', priority: 'high', dueDate: 'Nov 15', team: [{ id: 5, name: 'Alex Brown', role: 'Backend Developer' }] },
        { id: 4, title: 'Testing', description: 'Perform testing on API integration', status: 'to-do', priority: 'medium', dueDate: 'Nov 25', team: [{ id: 5, name: 'Alex Brown', role: 'Backend Developer' }] },
      ]
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
      state.activeProjects.push(newProject);
    },
  },
});

export const { setFilters, updateProjectProgress, createProject } = projectsSlice.actions;
export default projectsSlice.reducer;