'use client';

import { SessionProvider } from 'next-auth/react';
import { ReduxProvider } from '@/lib/redux/provider';

export function ClientProviders({
  children,
  session
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionProvider session={session}>
      <ReduxProvider>{children}</ReduxProvider>
    </SessionProvider>
  );
}