'use client';

import { SessionProvider } from 'next-auth/react';
import { ReduxProvider } from '@/lib/redux/provider';

interface ClientProvidersProps {
  children: React.ReactNode;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
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