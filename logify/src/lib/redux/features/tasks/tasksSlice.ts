import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tasksApi } from '@/lib/services/api';
import type { RootState } from '@/lib/redux/store';
import type {
  Task,
  TasksState,
  TaskStats,
  CreateTaskInput,
  UpdateTaskInput
} from './types';

const calculateStats = (tasks: Task[]): TaskStats => {
  const now = new Date();
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'to-do').length,
    overdue: tasks.filter(t => !t.isCompleted && new Date(t.dueDate) < now).length,
  };
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const auth = state.auth;

      if (!auth.session?.user) {
        throw new Error('User not authenticated');
      }

      const response = await tasksApi.getAll({
        admin_id: auth.admin_id || auth.session.user.id
      });

      return response.data;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to fetch tasks');
    }
  }
);

export const createTaskAsync = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskInput, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const auth = state.auth;

      if (!auth.session?.user) {
        throw new Error('User not authenticated');
      }

      const response = await tasksApi.create({
        ...taskData,
        isCompleted: false,
      });

      return response.data;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to create task');
    }
  }
);

export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: number; data: UpdateTaskInput }, { rejectWithValue }) => {
    try {
      const response = await tasksApi.update(id, data);
      return response.data;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to update task');
    }
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (id: number, { rejectWithValue }) => {
    try {
      await tasksApi.delete(id);
      return id;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to delete task');
    }
  }
);

const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
  filters: {
    status: [],
    priority: [],
    project: [],
    search: '',
    assignedTo: [],
  },
  stats: {
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    overdue: 0,
  },
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTaskFilters: (state, action: PayloadAction<Partial<TasksState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTaskFilters: (state) => {
      state.filters = initialState.filters;
    },
    toggleTaskComplete: (state, action: PayloadAction<number>) => {
      const task = state.items.find(t => t.id === action.payload);
      if (task) {
        task.isCompleted = !task.isCompleted;
        task.status = task.isCompleted ? 'completed' : 'to-do';
        state.stats = calculateStats(state.items);
      }
    },
    setTaskStatus: (state, action: PayloadAction<{ taskId: number; status: Task['status'] }>) => {
      const task = state.items.find(t => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.status;
        if (action.payload.status === 'completed') {
          task.isCompleted = true;
        }
        state.stats = calculateStats(state.items);
      }
    },
    assignTask: (state, action: PayloadAction<{ taskId: number; memberId: number }>) => {
      const task = state.items.find(t => t.id === action.payload.taskId);
      if (task && !task.assignedTo.includes(action.payload.memberId)) {
        task.assignedTo.push(action.payload.memberId);
      }
    },
    unassignTask: (state, action: PayloadAction<{ taskId: number; memberId: number }>) => {
      const task = state.items.find(t => t.id === action.payload.taskId);
      if (task) {
        task.assignedTo = task.assignedTo.filter(id => id !== action.payload.memberId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.stats = calculateStats(action.payload);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(createTaskAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.stats = calculateStats(state.items);
      })
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.stats = calculateStats(state.items);
        }
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(task => task.id !== action.payload);
        state.stats = calculateStats(state.items);
      });
  },
});

export const {
  setTaskFilters,
  clearTaskFilters,
  toggleTaskComplete,
  setTaskStatus,
  assignTask,
  unassignTask
} = tasksSlice.actions;

// Selectors
export const selectAllTasks = (state: RootState) => state.tasks.items;
export const selectTasksStatus = (state: RootState) => state.tasks.status;
export const selectTasksError = (state: RootState) => state.tasks.error;
export const selectTasksFilters = (state: RootState) => state.tasks.filters;
export const selectTaskStats = (state: RootState) => state.tasks.stats;

export const selectFilteredTasks = (state: RootState) => {
  const { items, filters } = state.tasks;
  
  return items.filter(task => {
    if (filters.status.length && !filters.status.includes(task.status)) return false;
    if (filters.priority.length && !filters.priority.includes(task.priority)) return false;
    if (filters.project.length && !filters.project.includes(task.projectId)) return false;
    if (filters.assignedTo.length && !filters.assignedTo.some(id => task.assignedTo.includes(id))) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
};

export default tasksSlice.reducer;