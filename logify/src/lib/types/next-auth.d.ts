import 'next-auth';
import { UserRole } from './auth';

declare module 'next-auth' {
  interface User {
    id: number;
    role: UserRole;
  }

  interface Session {
    user: {
      id: number;
      role: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number;
    role: UserRole;
  }
}