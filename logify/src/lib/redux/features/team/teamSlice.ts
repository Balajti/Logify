import { mockTeamMembers } from '@/lib/data/mockData';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

interface TeamState {
  members: TeamMember[];
  filters: {
    department: string[];
    status: string[];
    search: string;
  };
}

const initialState: TeamState = {
  members: mockTeamMembers,
  filters: {
    department: [],
    status: [],
    search: '',
  },
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTeamFilters: (state, action: PayloadAction<Partial<TeamState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setTeamFilters } = teamSlice.actions;
export default teamSlice.reducer;