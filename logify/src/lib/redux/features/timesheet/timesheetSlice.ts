// app/lib/features/timesheet/timesheetSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { timesheetApi } from '@/lib/services/api';

export interface TimesheetEntry {
  id: number;
  team_member_id: number;
  project_id: number;
  task_id: number;
  date: string;
  hours: number;
  description: string;
  created_at: string;
}

interface TimesheetSummary {
  totalHours: number;
  dailyAverage: number;
  weeklyTotal: number;
  monthlyTotal: number;
  projectDistribution: {
    project_id: number;
    hours: number;
    percentage: number;
  }[];
}

interface TimesheetState {
  entries: TimesheetEntry[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    startDate: string | null;
    endDate: string | null;
    team_member_id: number | null;
    project_id: number | null;
    task_id: number | null;
  };
  summary: TimesheetSummary;
  selectedEntry: TimesheetEntry | null;
}

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
};

// Calculate timesheet summary
const calculateTimesheetSummary = (entries: TimesheetEntry[]): TimesheetSummary => {
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  
  // Calculate project distribution
  const projectHours = entries.reduce((acc, entry) => {
    acc[entry.project_id] = (acc[entry.project_id] || 0) + entry.hours;
    return acc;
  }, {} as { [key: number]: number });

  const projectDistribution = Object.entries(projectHours).map(([project_id, hours]) => ({
    project_id: Number(project_id),
    hours,
    percentage: (hours / totalHours) * 100
  }));

  // Calculate weekly and monthly totals
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const weeklyTotal = entries
    .filter(entry => new Date(entry.date) >= startOfWeek)
    .reduce((sum, entry) => sum + entry.hours, 0);

  const monthlyTotal = entries
    .filter(entry => new Date(entry.date) >= startOfMonth)
    .reduce((sum, entry) => sum + entry.hours, 0);

  // Calculate daily average (excluding future dates)
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

// Async Thunks
export const fetchTimesheetEntries = createAsyncThunk(
  'timesheet/fetchEntries',
  async (filters: Partial<TimesheetState['filters']>, { rejectWithValue }) => {
    try {
      const response = await timesheetApi.getFiltered(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch timesheet entries');
    }
  }
);

export const createTimesheetEntry = createAsyncThunk(
  'timesheet/createEntry',
  async (entryData: Omit<TimesheetEntry, 'id' | 'created_at'>, { rejectWithValue }) => {
    try {
      const response = await timesheetApi.create(entryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create timesheet entry');
    }
  }
);

export const updateTimesheetEntry = createAsyncThunk(
  'timesheet/updateEntry',
  async ({ id, data }: { id: number; data: Partial<TimesheetEntry> }, { rejectWithValue }) => {
    try {
      const response = await timesheetApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update timesheet entry');
    }
  }
);

export const deleteTimesheetEntry = createAsyncThunk(
  'timesheet/deleteEntry',
  async (id: number, { rejectWithValue }) => {
    try {
      await timesheetApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete timesheet entry');
    }
  }
);

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
  },
  extraReducers: (builder) => {
    builder
      // Fetch entries
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
      // Create entry
      .addCase(createTimesheetEntry.fulfilled, (state, action) => {
        state.entries.push(action.payload);
        state.summary = calculateTimesheetSummary(state.entries);
      })
      // Update entry
      .addCase(updateTimesheetEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
          state.summary = calculateTimesheetSummary(state.entries);
        }
      })
      // Delete entry
      .addCase(deleteTimesheetEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(e => e.id !== action.payload);
        state.summary = calculateTimesheetSummary(state.entries);
        if (state.selectedEntry?.id === action.payload) {
          state.selectedEntry = null;
        }
      });
  },
});

// Export actions
export const {
  setTimesheetFilters,
  clearTimesheetFilters,
  selectEntry,
  updateSummary,
} = timesheetSlice.actions;

// Export reducer
export default timesheetSlice.reducer;

// Selectors
export const selectAllTimesheetEntries = (state: { timesheet: TimesheetState }) => 
  state.timesheet.entries;

export const selectTimesheetStatus = (state: { timesheet: TimesheetState }) => 
  state.timesheet.status;

export const selectTimesheetError = (state: { timesheet: TimesheetState }) => 
  state.timesheet.error;

export const selectTimesheetFilters = (state: { timesheet: TimesheetState }) => 
  state.timesheet.filters;

export const selectTimesheetSummary = (state: { timesheet: TimesheetState }) => 
  state.timesheet.summary;

export const selectSelectedEntry = (state: { timesheet: TimesheetState }) =>
  state.timesheet.selectedEntry;

export const selectFilteredEntries = (state: { timesheet: TimesheetState }) => {
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

export const selectEntriesByProject = (state: { timesheet: TimesheetState }, projectId: number) =>
  state.timesheet.entries.filter(entry => entry.project_id === projectId);

export const selectEntriesByTeamMember = (state: { timesheet: TimesheetState }, teamMemberId: number) =>
  state.timesheet.entries.filter(entry => entry.team_member_id === teamMemberId);