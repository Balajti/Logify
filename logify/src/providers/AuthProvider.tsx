'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { setSession } from '@/lib/redux/features/auth/authSlice';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSession(session));
  }, [session, dispatch]);

  return children;
}