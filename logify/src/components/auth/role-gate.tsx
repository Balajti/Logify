'use client';

import { useSession } from 'next-auth/react';
import type { UserRole } from '@/lib/types/auth';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { data: session } = useSession();
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}