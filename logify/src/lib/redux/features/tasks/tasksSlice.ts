// logify/src/lib/redux/features/tasks/tasksSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { tasksApi } from '@/lib/services/api';

// Type definitions
export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'to-do' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  projectId: number;
  assignedTo: number[];
  isCompleted: boolean;
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

// Helper function to calculate stats
const calculateStats = (tasks: Task[]) => {
  const now = new Date();
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'to-do').length,
    overdue: tasks.filter(t => !t.isCompleted && new Date(t.dueDate) < now).length,
  };
};

// Async thunks
const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async () => {
    const response = await tasksApi.getAll();
    if (response.status !== 200) {
      throw new Error('Failed to fetch tasks');
    }
    return response.data;
  }
);

const createTaskAsync = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Omit<Task, 'id' | 'isCompleted'>) => {
    const response = await tasksApi.create({ ...taskData, isCompleted: false });
    if (response.status !== 201) {
      throw new Error('Failed to create task');
    }
    return response.data;
  }
);

const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: number; data: Partial<Task> }) => {
    const response = await tasksApi.update(id, data);
    if (response.status !== 200) {
      throw new Error('Failed to update task');
    }
    return response.data;
  }
);

const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (id: number) => {
    const response = await tasksApi.delete(id);
    if (response.status !== 200) {
      throw new Error('Failed to delete task');
    }
    return id;
  }
);

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
    // Fetch all tasks
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

    // Create task
    builder
      .addCase(createTaskAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.stats = calculateStats(state.items);
      })

    // Update task
    builder
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.stats = calculateStats(state.items);
        }
      })

    // Delete task
    builder
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(task => task.id !== action.payload);
        state.stats = calculateStats(state.items);
      });
  },
});

// Export actions
export const { setTaskFilters, clearTaskFilters, toggleTaskComplete, setTaskStatus, assignTask, unassignTask } = tasksSlice.actions;

// Export thunks
export { fetchTasks, createTaskAsync, updateTaskAsync, deleteTaskAsync };

// Export selectors
export const selectAllTasks = (state: RootState) => state.tasks.items;
export const selectTasksStatus = (state: RootState) => state.tasks.status;
export const selectTasksError = (state: RootState) => state.tasks.error;

export default tasksSlice.reducer;