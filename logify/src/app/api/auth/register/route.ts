import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth";
import { createId } from '@paralleldrive/cuid2';
import { z } from "zod";
import { eq } from "drizzle-orm";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = registerSchema.parse(json);
    
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);
    const userId = createId();

    // Create user
    await db.insert(users).values({
      id: userId,
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: "admin", // First user gets admin role
    });

    return NextResponse.json({ 
      message: "User created successfully",
      userId
    });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}