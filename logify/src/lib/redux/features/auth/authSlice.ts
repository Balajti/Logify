import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Session } from 'next-auth';
import type { AuthState } from './types';
import { transformSession } from './types';

const initialState: AuthState = {
  session: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = transformSession(action.payload);
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
    },
    clearSession: (state) => {
      state.session = null;
      state.status = 'unauthenticated';
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setSession, clearSession, setError } = authSlice.actions;
export default authSlice.reducer;