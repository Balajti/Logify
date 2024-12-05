'use client';

import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import { store } from '@/lib/redux/store';
import { AuthProvider } from '@/providers/AuthProvider';

interface ClientProvidersProps {
  children: React.ReactNode;
  session: any;
}

export function ClientProviders({ children, session }: ClientProvidersProps) {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </Provider>
    </SessionProvider>
  );
}