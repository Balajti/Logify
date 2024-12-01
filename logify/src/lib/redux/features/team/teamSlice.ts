import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { teamApi } from '@/lib/services/api';
import type { RootState } from '@/lib/redux/store';
import type { 
  TeamMember, 
  TeamState, 
  TeamStats,
  CreateTeamMemberDTO,
  UpdateTeamMemberDTO
} from './types';

const calculateTeamStats = (members: TeamMember[]): TeamStats => {
  const departmentDistribution: Record<string, number> = {};
  let totalWorkload = 0;

  members.forEach(member => {
    if (member.department) {
      departmentDistribution[member.department] = 
        (departmentDistribution[member.department] || 0) + 1;
    }
    totalWorkload += member.workload.assigned;
  });

  const topPerformers = members
    .map(member => ({
      id: member.id,
      score: (member.performance.tasksCompleted * 0.4) + 
             ((member.performance.onTime) / Math.max(1, member.performance.tasksCompleted) * 0.6)
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

const transformMember = (data: any): TeamMember => ({
  id: data.id,
  admin_id: data.admin_id,
  name: data.name,
  role: data.role || '',
  department: data.department || '',
  email: data.email,
  phone: data.phone || '',
  avatar: data.avatar,
  status: data.status || 'offline',
  user_id: data.user_id,
  projects: data.projects || [],
  tasks: data.tasks || [],
  workload: {
    assigned: data.workload?.assigned || 0,
    completed: data.workload?.completed || 0,
  },
  performance: {
    tasksCompleted: data.performance?.tasksCompleted || 0,
    onTime: data.performance?.onTime || 0,
    overdue: data.performance?.overdue || 0,
  },
  availability: data.availability || 0,
});

// Async Thunks
export const fetchTeamMembers = createAsyncThunk(
  'team/fetchMembers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const auth = state.auth;

      if (!auth.session?.user) {
        throw new Error('User not authenticated');
      }

      const response = await teamApi.getAll({
        admin_id: auth.admin_id || auth.session.user.id
      });
      
      return response.data.map(transformMember);
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to fetch team members');
    }
  }
);

export const createTeamMember = createAsyncThunk(
  'team/createMember',
  async (memberData: CreateTeamMemberDTO, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const session = state.auth.session;

      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const response = await teamApi.create(memberData);
      return transformMember(response.data);
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to create team member');
    }
  }
);

export const updateTeamMember = createAsyncThunk(
  'team/updateMember',
  async ({ id, data }: { id: number; data: UpdateTeamMemberDTO }, { rejectWithValue }) => {
    try {
      const response = await teamApi.update(id, data);
      return transformMember(response.data);
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to update team member');
    }
  }
);

export const deleteTeamMember = createAsyncThunk(
  'team/deleteMember',
  async (id: number, { rejectWithValue }) => {
    try {
      await teamApi.delete(id);
      return id;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to delete team member');
    }
  }
);

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
      .addCase(createTeamMember.fulfilled, (state, action) => {
        state.members.push(action.payload);
        state.stats = calculateTeamStats(state.members);
      })
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        const index = state.members.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.members[index] = action.payload;
          state.stats = calculateTeamStats(state.members);
        }
      })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.members = state.members.filter(m => m.id !== action.payload);
        state.stats = calculateTeamStats(state.members);
        if (state.selectedMember === action.payload) {
          state.selectedMember = null;
        }
      });
  },
});

export const {
  setTeamFilters,
  clearTeamFilters,
  selectMember,
  updateMemberStatus,
  assignProject,
  removeFromProject,
} = teamSlice.actions;

// Selectors
export const selectAllTeamMembers = (state: RootState) => state.team.members;
export const selectTeamStatus = (state: RootState) => state.team.status;
export const selectTeamError = (state: RootState) => state.team.error;
export const selectTeamFilters = (state: RootState) => state.team.filters;
export const selectTeamStats = (state: RootState) => state.team.stats;
export const selectSelectedMember = (state: RootState) => 
  state.team.members.find(m => m.id === state.team.selectedMember);

export const selectFilteredTeamMembers = (state: RootState) => {
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

export const selectTeamMembersByProject = (state: RootState, projectId: number) =>
  state.team.members.filter(member => member.projects.includes(projectId));

export const selectAvailableMembers = (state: RootState) =>
  state.team.members.filter(member => member.availability >= 20);

export const selectTeamMemberById = (state: RootState, memberId: number) =>
  state.team.members.find(m => m.id === memberId);

export default teamSlice.reducer;