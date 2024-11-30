import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { team_members, users } from "@/lib/db/schema";
import { createId } from '@paralleldrive/cuid2';
import { hashPassword, generatePassword, authOptions } from "@/lib/auth";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";
import { getServerSession } from "next-auth";

const teamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string(),
  role: z.string(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  status: z.enum(['active', 'away', 'offline']).default('active'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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
        adminId: session.user.id,
      });
        await tx.insert(team_members).values({
          name: body.name,
          email: body.email,
          department: body.department || '',
          status: body.status,
          userId: userId,
          adminId: session.user.id,
          role: ''
        });
    });


    // Send welcome email
    const emailSent = await sendWelcomeEmail(
      body.email,
      body.name,
      password
    );

    return NextResponse.json({ 
      id: userId,
      ...body,
      temporaryPassword: password,
      emailSent
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