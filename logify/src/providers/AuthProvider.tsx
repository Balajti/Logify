'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { setSession, fetchAdminId, selectAdminId } from '@/lib/redux/features/auth/authSlice';
import { AppDispatch } from '@/lib/redux/store';
import { useAppSelector } from '@/lib/redux/hooks';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();


  useEffect(() => {
    if (status === 'authenticated' && session) {
      dispatch(setSession(session));
      
      // If user is not an admin, fetch their admin_id
      if (session.user.role !== 'admin') {
        dispatch(fetchAdminId(session.user.id)).then((action) => {
          if (fetchAdminId.fulfilled.match(action)) {
            console.log('Admin ID fetched:', action.payload);
          }
        });
      }
    } else if (status === 'unauthenticated') {
      dispatch(setSession(null));
    }
  }, [session, status, dispatch]);

  return children;
}