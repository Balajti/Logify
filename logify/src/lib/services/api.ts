import axios, { AxiosError } from 'axios';
import type { 
  Project, 
  Task, 
  TeamMember, 
  TimesheetEntry,
  CreateDTO,
  UpdateDTO
} from './types';

interface ApiError {
  error: string;
  details?: any;
}

type QueryParams = {
  admin_id?: string;
  [key: string]: any;
};

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const projectsApi = {
  getAll: (params?: QueryParams) => 
    api.get<Project[]>('/projects', { params }),
    
  getById: (id: number, params?: QueryParams) => 
    api.get<Project>(`/projects/${id}`, { params }),
    
  create: (data: CreateDTO<Project>) => 
    api.post<Project>('/projects', data),
    
  update: (id: number, data: UpdateDTO<Project>) => 
    api.patch<Project>(`/projects/${id}`, data),
    
  delete: (id: number) => 
    api.delete(`/projects/${id}`),
};

export const tasksApi = {
  getAll: (params?: QueryParams) => 
    api.get<Task[]>('/tasks', { params }),
    
  getById: (id: number, params?: QueryParams) => 
    api.get<Task>(`/tasks/${id}`, { params }),
    
  create: (data: CreateDTO<Task>) => 
    api.post<Task>('/tasks', data),
    
  update: (id: number, data: UpdateDTO<Task>) => 
    api.patch<Task>(`/tasks/${id}`, data),
    
  delete: (id: number) => 
    api.delete(`/tasks/${id}`),
};

export const teamApi = {
  getAll: (params?: QueryParams) => 
    api.get<TeamMember[]>('/team-members', { params }),
    
  getById: (id: number, params?: QueryParams) => 
    api.get<TeamMember>(`/team-members/${id}`, { params }),
    
  create: (data: CreateDTO<TeamMember>) => 
    api.post<TeamMember>('/team-members', data),
    
  update: (id: number, data: UpdateDTO<TeamMember>) => 
    api.patch<TeamMember>(`/team-members/${id}`, data),
    
  delete: (id: number) => 
    api.delete(`/team-members/${id}`),
};

export const timesheetApi = {
  getAll: (params?: QueryParams) => 
    api.get<TimesheetEntry[]>('/timesheet', { params }),
    
  getFiltered: (params: QueryParams & {
    team_member_id?: number;
    project_id?: number;
    start_date?: string;
    end_date?: string;
  }) => api.get<TimesheetEntry[]>('/timesheet', { params }),
  
  create: (data: CreateDTO<TimesheetEntry>) => 
    api.post<TimesheetEntry>('/timesheet', data),
    
  update: (id: number, data: UpdateDTO<TimesheetEntry>) => 
    api.patch<TimesheetEntry>(`/timesheet/${id}`, data),
    
  delete: (id: number) => 
    api.delete(`/timesheet/${id}`),
};