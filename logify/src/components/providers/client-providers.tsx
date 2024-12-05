'use client';

import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import { store } from '@/lib/redux/store';
import { Session } from 'next-auth';
import { AuthProvider } from '@/providers/AuthProvider';

interface ClientProvidersProps {
  children: React.ReactNode;
  session: Session | null;
}

export function ClientProviders({ children, session }: ClientProvidersProps) {
  
  return (
    <Provider store={store}>
      <SessionProvider session={session}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </SessionProvider>
    </Provider>
  );
}