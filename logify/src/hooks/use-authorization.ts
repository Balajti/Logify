import { useSession } from 'next-auth/react';
import type { UserRole } from '@/lib/types/auth';

export function useAuthorization() {
  const { data: session } = useSession();
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id;

  return {
    isAdmin: userRole === 'admin',
    isEmployee: userRole === 'employee',
    userRole,
    userId,
    hasPermission: (allowedRoles: UserRole[]) => allowedRoles.includes(userRole),
  };
}