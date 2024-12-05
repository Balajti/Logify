import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      admin_id?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    admin_id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    admin_id?: string;
  }
}