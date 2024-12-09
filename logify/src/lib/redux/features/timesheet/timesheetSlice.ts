import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { timesheetApi } from '@/lib/services/api';
import type { RootState } from '@/lib/redux/store';
import type {
  TimesheetEntry,
  TimesheetState,
  TimesheetSummary,
  CreateTimesheetEntryInput,
  UpdateTimesheetEntryInput
} from './types';
import { useSession } from 'next-auth/react';
import { useAppSelector } from '../../hooks';
import { selectAllTeamMembers } from '../team/teamSlice';

const calculateTimesheetSummary = (entries: TimesheetEntry[]): TimesheetSummary => {
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  
  const projectHours = entries.reduce((acc, entry) => {
    acc[entry.project_id] = (acc[entry.project_id] || 0) + entry.hours;
    return acc;
  }, {} as Record<number, number>);

  const projectDistribution = Object.entries(projectHours).map(([project_id, hours]) => ({
    project_id: Number(project_id),
    hours,
    percentage: (hours / totalHours) * 100
  }));

  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const weeklyTotal = entries
    .filter(entry => new Date(entry.date) >= startOfWeek)
    .reduce((sum, entry) => sum + entry.hours, 0);

  const monthlyTotal = entries
    .filter(entry => new Date(entry.date) >= startOfMonth)
    .reduce((sum, entry) => sum + entry.hours, 0);

  const pastEntries = entries.filter(entry => new Date(entry.date) <= new Date());
  const uniqueDays = new Set(pastEntries.map(entry => entry.date)).size;
  const dailyAverage = uniqueDays > 0 ? totalHours / uniqueDays : 0;

  return {
    totalHours,
    dailyAverage,
    weeklyTotal,
    monthlyTotal,
    projectDistribution,
  };
};

export const fetchTimesheetEntries = createAsyncThunk(
  'timesheet/fetchEntries',
  async (filters: { team_member_id?: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const auth = state.auth;

      if (!auth.session?.user) {
        throw new Error('User not authenticated');
      }

      const queryParams: Record<string, any> = {
        ...filters,
        admin_id: auth.admin_id || auth.session.user.id
      };

      // If user is not admin, only show their own entries
      if (auth.session.user.role !== 'admin') {
        queryParams.team_member_id = auth.session.user.id;
      }

      const response = await timesheetApi.getFiltered(queryParams);
      return response.data;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to fetch timesheet entries');
    }
  }
);

export const createTimesheetEntry = createAsyncThunk(
  'timesheet/createEntry',
  async (entryData: CreateTimesheetEntryInput, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const session = state.auth.session;

      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const response = await timesheetApi.create(entryData);
      return response.data;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to create timesheet entry');
    }
  }
);

export const updateTimesheetEntry = createAsyncThunk(
  'timesheet/updateEntry',
  async ({ id, data }: { id: number; data: UpdateTimesheetEntryInput }, { rejectWithValue }) => {
    try {
      const response = await timesheetApi.update(id, data);
      return response.data;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to update timesheet entry');
    }
  }
);

export const deleteTimesheetEntry = createAsyncThunk(
  'timesheet/deleteEntry',
  async (id: number, { rejectWithValue }) => {
    try {
      await timesheetApi.delete(id);
      return id;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to delete timesheet entry');
    }
  }
);

const initialState: TimesheetState = {
  entries: [],
  status: 'idle',
  error: null,
  filters: {
    startDate: null,
    endDate: null,
    team_member_id: null,
    project_id: null,
    task_id: null,
  },
  summary: {
    totalHours: 0,
    dailyAverage: 0,
    weeklyTotal: 0,
    monthlyTotal: 0,
    projectDistribution: [],
  },
  selectedEntry: null,
  selectedEmployee: null,
};

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    setTimesheetFilters: (state, action: PayloadAction<Partial<TimesheetState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTimesheetFilters: (state) => {
      state.filters = initialState.filters;
    },
    selectEntry: (state, action: PayloadAction<TimesheetEntry>) => {
      state.selectedEntry = action.payload;
    },
    updateSummary: (state) => {
      state.summary = calculateTimesheetSummary(state.entries);
    },
    setSelectedEmployee(state, action: PayloadAction<number>) {
      state.selectedEmployee = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimesheetEntries.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTimesheetEntries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.entries = action.payload;
        state.summary = calculateTimesheetSummary(action.payload);
      })
      .addCase(fetchTimesheetEntries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createTimesheetEntry.fulfilled, (state, action) => {
        state.entries.push(action.payload);
        state.summary = calculateTimesheetSummary(state.entries);
      })
      .addCase(updateTimesheetEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
          state.summary = calculateTimesheetSummary(state.entries);
        }
      })
      .addCase(deleteTimesheetEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(e => e.id !== action.payload);
        state.summary = calculateTimesheetSummary(state.entries);
        if (state.selectedEntry?.id === action.payload) {
          state.selectedEntry = null;
        }
      });
  },
});

export const {
  setTimesheetFilters,
  clearTimesheetFilters,
  selectEntry,
  updateSummary,
  setSelectedEmployee,
} = timesheetSlice.actions;

// Selectors
export const selectAllTimesheetEntries = (state: RootState) => state.timesheet.entries;
export const selectTimesheetStatus = (state: RootState) => state.timesheet.status;
export const selectTimesheetError = (state: RootState) => state.timesheet.error;
export const selectTimesheetFilters = (state: RootState) => state.timesheet.filters;
export const selectTimesheetSummary = (state: RootState) => state.timesheet.summary;
export const selectSelectedEntry = (state: RootState) => state.timesheet.selectedEntry;
export const selectSelectedEmployee = (state: RootState) => state.timesheet.selectedEmployee;

export const selectFilteredEntries = (state: RootState) => {
  const { entries, filters } = state.timesheet;
  
  return entries.filter(entry => {
    if (filters.team_member_id && entry.team_member_id !== filters.team_member_id) return false;
    if (filters.project_id && entry.project_id !== filters.project_id) return false;
    if (filters.task_id && entry.task_id !== filters.task_id) return false;
    if (filters.startDate && new Date(entry.date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(entry.date) > new Date(filters.endDate)) return false;
    return true;
  });
};

export const selectEntriesByProject = (state: RootState, projectId: number) =>
  state.timesheet.entries.filter(entry => entry.project_id === projectId);

export const selectEntriesByTeamMember = (state: RootState, teamMemberId: number) =>
  state.timesheet.entries.filter(entry => entry.team_member_id === teamMemberId);

export default timesheetSlice.reducer;