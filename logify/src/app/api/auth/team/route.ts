import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createId } from '@paralleldrive/cuid2';
import { hashPassword, generatePassword } from "@/lib/auth";
import { z } from "zod";

const teamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'away', 'offline']).default('active'),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = teamMemberSchema.parse(json);
    
    // Generate random password
    const password = generatePassword();
    const hashedPassword = await hashPassword(password);
    const userId = createId();

    await db.transaction(async (tx) => {
      // Create user account
      await tx.insert(users).values({
        id: userId,
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: "user",
      });
    });

    return NextResponse.json({ 
      id: userId,
      ...body,
      temporaryPassword: password // Only sent in response, not stored
    }, { status: 201 });
    
  } catch (error) {
    console.error('Failed to create team member:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}