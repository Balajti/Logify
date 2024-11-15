import { mockTasks } from '@/lib/data/mockData';
import { Tasks } from '@/lib/types/task';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/* export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate: string;
  project: string;
  isCompleted: boolean;
}
 */
interface TasksState {
  items: Tasks[];
  filters: {
    status: string[];
    priority: string[];
    project: number[];
    search: string;
  };
}

const initialState: TasksState = {
  items: mockTasks,
  filters: {
    status: [],
    priority: [],
    project: [],
    search: '',
  },
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTaskFilters: (state, action: PayloadAction<Partial<TasksState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleTaskComplete: (state, action: PayloadAction<number>) => {
      const task = state.items.find(t => t.id === Number(action.payload));
      if (task) {
        task.isCompleted = !task.isCompleted;
      }
    },
    updateTask: (state, action: PayloadAction<Tasks>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(task => task.id !== Number(action.payload));
    },
    addTask: (state, action: PayloadAction<Omit<Tasks, 'id'>>) => {
      const newTask: Tasks = {
        ...action.payload,
        id: state.items.length + 1,
      };
      state.items.push(newTask);
    },
  },
});

export const { 
  setTaskFilters, 
  toggleTaskComplete, 
  updateTask, 
  deleteTask,
  addTask 
} = tasksSlice.actions;

export default tasksSlice.reducer;