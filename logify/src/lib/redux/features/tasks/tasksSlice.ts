import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
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

interface TasksState {
  items: Task[];
  filters: {
    status: string[];
    priority: string[];
    project: string[];
    search: string;
  };
}

const initialState: TasksState = {
  items: [
    {
      id: '1',
      title: 'Design user interface',
      description: 'Create wireframes and mockups for the new dashboard',
      status: 'in-progress',
      priority: 'high',
      assignee: {
        id: '1',
        name: 'John Doe',
      },
      dueDate: '2024-11-01',
      project: 'Website Redesign',
      isCompleted: false,
    },
    {
        id: '2',
        title: 'Make the website responsive',
        description: 'Make the website responsive for mobile and tablet devices',
        status: 'completed',
        priority: 'medium',
        assignee: {
          id: '2',
          name: 'Jane Smith',
        },
        dueDate: '2024-12-01',
        project: 'Website Redesign',
        isCompleted: true,
      },
      {
        id: '3',
        title: 'Create wireframes and mockups',
        description: 'Create wireframes and mockups for the new dashboard',
        status: 'todo',
        priority: 'high',
        assignee: {
          id: '1',
          name: 'John Doe',
        },
        dueDate: '2024-11-01',
        project: 'Mobile App Development',
        isCompleted: false,
      },
  ],
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
    toggleTaskComplete: (state, action: PayloadAction<string>) => {
      const task = state.items.find(t => t.id === action.payload);
      if (task) {
        task.isCompleted = !task.isCompleted;
      }
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(task => task.id !== action.payload);
    },
    addTask: (state, action: PayloadAction<Omit<Task, 'id'>>) => {
      const newTask: Task = {
        ...action.payload,
        id: `task-${state.items.length + 1}`,
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