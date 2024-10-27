import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'away' | 'offline';
  projects: number;
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
  members: [
    {
      id: '1',
      name: 'John Doe',
      role: 'Lead Developer',
      department: 'Engineering',
      email: 'john@example.com',
      phone: '+1 234 567 890',
      status: 'active',
      projects: 5,
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'UX Designer',
      department: 'Design',
      email: 'jane@example.com',
      phone: '+1 234 567 891',
      status: 'away',
      projects: 3,
    },
    {
      id: '3',
      name: 'Jane doe',
      role: 'UX Designer',
      department: 'Design',
      email: 'janeDoe@example.com',
      phone: '+1 234 567 891',
      status: 'offline',
      projects: 3,
    },
    // Add more team members
  ],
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