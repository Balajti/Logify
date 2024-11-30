import { NextAuthOptions } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as any, // Type casting to avoid adapter compatibility issues
  session: {
    strategy: "jwt"
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user" // Default role for Google sign-ins
        };
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email)
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.admin_id = user.admin_id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.admin_id = token.admin_id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export function generatePassword(): string {
  // Define character sets
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  // Password requirements
  const length = 12;
  const minLowercase = 2;
  const minUppercase = 2;
  const minNumbers = 2;
  const minSymbols = 1;

  let password = '';

  // Add minimum required characters
  for (let i = 0; i < minLowercase; i++) {
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  }
  for (let i = 0; i < minUppercase; i++) {
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  }
  for (let i = 0; i < minNumbers; i++) {
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  for (let i = 0; i < minSymbols; i++) {
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  }

  // Fill remaining length with random characters from all sets
  const allChars = lowercase + uppercase + numbers + symbols;
  const remainingLength = length - password.length;
  for (let i = 0; i < remainingLength; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password
  return password
    .split('')  
    .sort(() => Math.random() - 0.5)
    .join('');
}

// Optional: Add a function to verify password complexity
export function verifyPasswordStrength(password: string): boolean {
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*]/.test(password);
  const isLongEnough = password.length >= 8;

  return hasLowercase && hasUppercase && hasNumber && hasSymbol && isLongEnough;
}

// Optional: Add a function to compare passwords
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}