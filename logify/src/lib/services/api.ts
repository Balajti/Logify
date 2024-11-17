import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id: number) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: number, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

export const tasksApi = {
  getAll: () => api.get('/tasks'),
  getById: (id: number) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: number, data: any) => api.patch(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};

export const teamApi = {
  getAll: () => api.get('/team-members'),
  getById: (id: number) => api.get(`/team-members/${id}`),
  create: (data: any) => api.post('/team-members', data),
  update: (id: number, data: any) => api.patch(`/team-members/${id}`, data),
  delete: (id: number) => api.delete(`/team-members/${id}`),
};

export const timesheetApi = {
  getAll: () => api.get('/timesheet'),
  getFiltered: (params: any) => api.get('/timesheet', { params }),
  create: (data: any) => api.post('/timesheet', data),
  update: (id: number, data: any) => api.patch(`/timesheet/${id}`, data),
  delete: (id: number) => api.delete(`/timesheet/${id}`),
};