import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// app/lib/services/api.ts
import axios from 'axios';
import { Project } from './features/projects/projectsSlice';
import { Task } from './features/tasks/tasksSlice';
import { TeamMember } from './features/team/teamSlice';
import { TimesheetEntry } from './features/timesheet/timesheetSlice';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const projectsApi = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: number) => api.get<Project>(`/projects/${id}`),
  create: (data: Omit<Project, 'id'>) => api.post<Project>('/projects', data),
  update: (id: number, data: Partial<Project>) => api.patch<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.delete<void>(`/projects/${id}`),
};

export const tasksApi = {
  getAll: () => api.get<Task[]>('/tasks'),
  getById: (id: number) => api.get<Task>(`/tasks/${id}`),
  create: (data: Omit<Task, 'id'>) => api.post<Task>('/tasks', data),
  update: (id: number, data: Partial<Task>) => api.patch<Task>(`/tasks/${id}`, data),
  delete: (id: number) => api.delete<void>(`/tasks/${id}`),
};

export const teamApi = {
  getAll: () => api.get<TeamMember[]>('/team-members'),
  getById: (id: number) => api.get<TeamMember>(`/team-members/${id}`),
  create: (data: Omit<TeamMember, 'id'>) => api.post<TeamMember>('/team-members', data),
  update: (id: number, data: Partial<TeamMember>) => api.patch<TeamMember>(`/team-members/${id}`, data),
  delete: (id: number) => api.delete<void>(`/team-members/${id}`),
};

export const timesheetApi = {
  getAll: () => api.get<TimesheetEntry[]>('/timesheet'),
  getFiltered: (params: any) => api.get<TimesheetEntry[]>('/timesheet', { params }),
  create: (data: Omit<TimesheetEntry, 'id' | 'created_at'>) => 
    api.post<TimesheetEntry>('/timesheet', data),
  update: (id: number, data: Partial<TimesheetEntry>) => 
    api.patch<TimesheetEntry>(`/timesheet/${id}`, data),
  delete: (id: number) => api.delete<void>(`/timesheet/${id}`),
};