import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { User } from "next-auth";
import type { UserRole } from "@/lib/types/auth";

interface ExtendedUser extends User {
  role: UserRole;
}

const users: ExtendedUser[] = [
  {
    id: "1",
    name: "Admin User",
    email: "demo@logify.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Demo Employee",
    email: "employee@logify.com",
    role: "employee",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (
          (credentials.email === "demo@logify.com" && credentials.password === "demo123") ||
          (credentials.email === "employee@logify.com" && credentials.password === "demo123")
        ) {
          return users.find(user => user.email === credentials.email) || null;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as ExtendedUser).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};