import { Session } from 'next-auth';

export interface AuthUser {
  id: string;
  role: string;
  admin_id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export interface AuthState {
  session: {
    user?: AuthUser | null;
    expires?: string;
  } | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
}

// Helper function to transform NextAuth session to our auth state format
export function transformSession(session: Session | null): AuthState['session'] {
  if (!session) return null;
  
  return {
    user: session.user ? {
      id: session.user.id,
      role: session.user.role,
      admin_id: session.user.admin_id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    } : null,
    expires: session.expires
  };
}