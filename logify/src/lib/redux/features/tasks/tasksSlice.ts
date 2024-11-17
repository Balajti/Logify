// app/lib/features/tasks/tasksSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { tasksApi } from '@/lib/services/api';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'to-do' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  isCompleted: boolean;
  projectId: number;
  assignedTo: number[]; // team member IDs
  createdAt?: string;
  updatedAt?: string;
}

interface TasksState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    status: string[];
    priority: string[];
    project: number[];
    search: string;
    assignedTo: number[];
  };
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
  };
}

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

// Async Thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tasksApi.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tasks');
    }
  }
);

export const fetchTasksByProject = createAsyncThunk(
  'tasks/fetchTasksByProject',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const response = await tasksApi.getAll();
      return response.data.filter((task: Task) => task.projectId === projectId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project tasks');
    }
  }
);

export const createTaskAsync = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await tasksApi.create(taskData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create task');
    }
  }
);

export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: number; data: Partial<Task> }, { rejectWithValue }) => {
    try {
      const response = await tasksApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update task');
    }
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (id: number, { rejectWithValue }) => {
    try {
      await tasksApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete task');
    }
  }
);

// Helper function to calculate stats
const calculateStats = (tasks: Task[]) => {
  const now = new Date();
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'to-do').length,
    overdue: tasks.filter(t => {
      return !t.isCompleted && 
        new Date(t.dueDate) < now
    }).length,
  };
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tasks
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
        state.error = action.payload as string;
      })
      // Fetch project tasks
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        const nonProjectTasks = state.items.filter(
          task => !action.payload.find((t: Task) => t.id === task.id)
        );
        state.items = [...nonProjectTasks, ...action.payload];
        state.stats = calculateStats(state.items);
      })
      // Create task
      .addCase(createTaskAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTaskAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
        state.stats = calculateStats(state.items);
      })
      .addCase(createTaskAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Update task
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.stats = calculateStats(state.items);
        }
      })
      // Delete task
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(task => task.id !== action.payload);
        state.stats = calculateStats(state.items);
      });
  },
});

// Export actions
export const {
  setTaskFilters,
  clearTaskFilters,
  toggleTaskComplete,
  setTaskStatus,
} = tasksSlice.actions;

// Export reducer
export default tasksSlice.reducer;

// Selectors
export const selectAllTasks = (state: { tasks: TasksState }) => state.tasks.items;
export const selectTasksStatus = (state: { tasks: TasksState }) => state.tasks.status;
export const selectTasksError = (state: { tasks: TasksState }) => state.tasks.error;
export const selectTaskFilters = (state: { tasks: TasksState }) => state.tasks.filters;
export const selectTaskStats = (state: { tasks: TasksState }) => state.tasks.stats;

export const selectTaskById = (state: { tasks: TasksState }, taskId: number) =>
  state.tasks.items.find(task => task.id === taskId);

export const selectTasksByProject = (state: { tasks: TasksState }, projectId: number) =>
  state.tasks.items.filter(task => task.projectId === projectId);

export const selectFilteredTasks = (state: { tasks: TasksState }) => {
  const { items, filters } = state.tasks;
  
  return items.filter(task => {
    if (filters.status.length && !filters.status.includes(task.status)) return false;
    if (filters.priority.length && !filters.priority.includes(task.priority)) return false;
    if (filters.project.length && !filters.project.includes(task.projectId)) return false;
    if (filters.assignedTo.length && !task.assignedTo.some(id => filters.assignedTo.includes(id))) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
};

export const selectOverdueTasks = (state: { tasks: TasksState }) => {
  const now = new Date();
  return state.tasks.items.filter(task => 
    !task.isCompleted && new Date(task.dueDate) < now
  );
};