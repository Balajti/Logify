// app/lib/features/team/teamSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { teamApi } from '@/lib/services/api';

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'away' | 'offline';
  projects: number[];
  tasks: number[];
  workload: {
    assigned: number;
    completed: number;
  };
  performance: {
    tasksCompleted: number;
    onTime: number;
    overdue: number;
  };
  availability: number; // percentage of availability
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  departmentDistribution: {
    [key: string]: number;
  };
  averageWorkload: number;
  topPerformers: number[];
}

interface TeamState {
  members: TeamMember[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    department: string[];
    status: string[];
    search: string;
    availability: number | null;
    project: number | null;
  };
  stats: TeamStats;
  selectedMember: number | null;
}

const initialState: TeamState = {
  members: [],
  status: 'idle',
  error: null,
  filters: {
    department: [],
    status: [],
    search: '',
    availability: null,
    project: null,
  },
  stats: {
    totalMembers: 0,
    activeMembers: 0,
    departmentDistribution: {},
    averageWorkload: 0,
    topPerformers: [],
  },
  selectedMember: null,
};

// Calculate team statistics
const calculateTeamStats = (members: TeamMember[]): TeamStats => {
  const departmentDistribution: { [key: string]: number } = {};
  let totalWorkload = 0;

  members.forEach(member => {
    // Update department distribution
    departmentDistribution[member.department] = 
      (departmentDistribution[member.department] || 0) + 1;
    
    // Add to total workload
    totalWorkload += member.workload.assigned;
  });

  // Calculate top performers based on completion rate and on-time delivery
  const topPerformers = members
    .map(member => ({
      id: member.id,
      score: (member.performance.tasksCompleted * 0.4) + 
             (member.performance.onTime / Math.max(1, member.performance.tasksCompleted) * 0.6)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(performer => performer.id);

  return {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    departmentDistribution,
    averageWorkload: members.length ? totalWorkload / members.length : 0,
    topPerformers,
  };
};

// Async Thunks
export const fetchTeamMembers = createAsyncThunk(
  'team/fetchMembers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await teamApi.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch team members');
    }
  }
);

export const createTeamMember = createAsyncThunk(
  'team/createMember',
  async (memberData: Omit<TeamMember, 'id'>, { rejectWithValue }) => {
    try {
      const response = await teamApi.create(memberData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create team member');
    }
  }
);

export const updateTeamMember = createAsyncThunk(
  'team/updateMember',
  async ({ id, data }: { id: number; data: Partial<TeamMember> }, { rejectWithValue }) => {
    try {
      const response = await teamApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update team member');
    }
  }
);

export const deleteTeamMember = createAsyncThunk(
  'team/deleteMember',
  async (id: number, { rejectWithValue }) => {
    try {
      await teamApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete team member');
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTeamFilters: (state, action: PayloadAction<Partial<TeamState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTeamFilters: (state) => {
      state.filters = initialState.filters;
    },
    selectMember: (state, action: PayloadAction<number | null>) => {
      state.selectedMember = action.payload;
    },
    updateMemberStatus: (state, action: PayloadAction<{ id: number; status: TeamMember['status'] }>) => {
      const member = state.members.find(m => m.id === action.payload.id);
      if (member) {
        member.status = action.payload.status;
        state.stats = calculateTeamStats(state.members);
      }
    },
    assignProject: (state, action: PayloadAction<{ memberId: number; projectId: number }>) => {
      const member = state.members.find(m => m.id === action.payload.memberId);
      if (member && !member.projects.includes(action.payload.projectId)) {
        member.projects.push(action.payload.projectId);
      }
    },
    removeFromProject: (state, action: PayloadAction<{ memberId: number; projectId: number }>) => {
      const member = state.members.find(m => m.id === action.payload.memberId);
      if (member) {
        member.projects = member.projects.filter(id => id !== action.payload.projectId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch team members
      .addCase(fetchTeamMembers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.members = action.payload;
        state.stats = calculateTeamStats(action.payload);
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create team member
      .addCase(createTeamMember.fulfilled, (state, action) => {
        state.members.push(action.payload);
        state.stats = calculateTeamStats(state.members);
      })
      // Update team member
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        const index = state.members.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.members[index] = action.payload;
          state.stats = calculateTeamStats(state.members);
        }
      })
      // Delete team member
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.members = state.members.filter(m => m.id !== action.payload);
        state.stats = calculateTeamStats(state.members);
        if (state.selectedMember === action.payload) {
          state.selectedMember = null;
        }
      });
  },
});

// Export actions
export const {
  setTeamFilters,
  clearTeamFilters,
  selectMember,
  updateMemberStatus,
  assignProject,
  removeFromProject,
} = teamSlice.actions;

// Export reducer
export default teamSlice.reducer;

// Selectors
export const selectAllTeamMembers = (state: { team: TeamState }) => state.team.members;
export const selectTeamStatus = (state: { team: TeamState }) => state.team.status;
export const selectTeamError = (state: { team: TeamState }) => state.team.error;
export const selectTeamFilters = (state: { team: TeamState }) => state.team.filters;
export const selectTeamStats = (state: { team: TeamState }) => state.team.stats;
export const selectSelectedMember = (state: { team: TeamState }) => 
  state.team.members.find(m => m.id === state.team.selectedMember);

export const selectFilteredTeamMembers = (state: { team: TeamState }) => {
  const { members, filters } = state.team;
  
  return members.filter(member => {
    if (filters.department.length && !filters.department.includes(member.department)) return false;
    if (filters.status.length && !filters.status.includes(member.status)) return false;
    if (filters.project !== null && !member.projects.includes(filters.project)) return false;
    if (filters.availability !== null && member.availability < filters.availability) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.role.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
};

export const selectTeamMembersByProject = (state: { team: TeamState }, projectId: number) =>
  state.team.members.filter(member => member.projects.includes(projectId));

export const selectAvailableMembers = (state: { team: TeamState }) =>
  state.team.members.filter(member => member.availability >= 20);