import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { User } from "next-auth";
import type { UserRole } from "@/lib/types/auth";

interface ExtendedUser extends User {
  role: UserRole;
}

const users: ExtendedUser[] = [
  {
    id: 1,
    name: "Admin User",
    email: "demo@logify.com",
    role: "admin",
  },
  {
    id: 2,
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
      async authorize(credentials): Promise<User | null> {
        console.log('Auth attempt:', {
          email: credentials?.email,
          passwordProvided: !!credentials?.password
        });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }
      
        const validCombinations = [
          { email: "demo@logify.com", password: "demo123" },
          { email: "employee@logify.com", password: "demo123" }
        ];
      
        const isValid = validCombinations.some(
          combo => combo.email === credentials.email && combo.password === credentials.password
        );
      
        console.log('Auth result:', { isValid });
      
        if (isValid) {
          const user = users.find(user => user.email === credentials.email);
          console.log('Found user:', user);
          return user ?? null;
        }
      
        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as ExtendedUser).role;
        token.id = Number(user.id);
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
    error: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}satisfies NextAuthOptions;