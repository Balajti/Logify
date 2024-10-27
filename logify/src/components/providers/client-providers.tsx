'use client';

import { SessionProvider } from 'next-auth/react';
import { ReduxProvider } from '@/lib/redux/provider';

interface ClientProvidersProps {
  children: React.ReactNode;
  session: any;
}

export function ClientProviders({ children, session }: ClientProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ReduxProvider>
        {children}
      </ReduxProvider>
    </SessionProvider>
  );
}