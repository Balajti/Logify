import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Session } from 'next-auth';
import type { AuthState } from './types';
import { transformSession } from './types';
import { log } from 'console';

// Create async thunk to fetch admin_id
export const fetchAdminId = createAsyncThunk(
  'auth/fetchAdminId',
  async (userId: string) => {
    const response = await fetch('/api/team-members/user-admin?userId=' + userId);
    if (!response.ok) {
      throw new Error('Failed to fetch admin ID');
    }
    const data = await response.json();
    return data.admin_id;
  }
);

const initialState: AuthState = {
  session: null,
  status: 'idle',
  error: null,
  admin_id: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = transformSession(action.payload);
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
      // If user is an admin, set admin_id to their own id
      if (action.payload?.user?.role === 'admin') {
        state.admin_id = action.payload.user.id;
      }
    },
    clearSession: (state) => {
      state.session = null;
      state.status = 'unauthenticated';
      state.admin_id = '';
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdminId.fulfilled, (state, action) => {
      state.admin_id = action.payload;
      if (state.session?.user) {
        state.session.user.admin_id = action.payload;
      }
    });
  },
});

export const { setSession, clearSession, setError } = authSlice.actions;
export default authSlice.reducer;

export const selectAdminId = (state: { auth: AuthState }) => state.auth.admin_id;
