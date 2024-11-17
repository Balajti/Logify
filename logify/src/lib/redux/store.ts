import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './features/tasks/tasksSlice';
import teamReducer from './features/team/teamSlice';
import projectsReducer from './features/projects/projectsSlice';
import timesheetReducer from './features/timesheet/timesheetSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    team: teamReducer,
    projects: projectsReducer,
    timesheet: timesheetReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;