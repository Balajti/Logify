import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createId } from '@paralleldrive/cuid2';
import { hashPassword, generatePassword, authOptions } from "@/lib/auth";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";
import { getServerSession } from "next-auth";
import { sql } from '@vercel/postgres';

const teamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  phone: z.string().optional(),
  status: z.enum(['active', 'away', 'offline']).default('active'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('sesssioon', session);

    const json = await request.json();
    const body = teamMemberSchema.parse(json);
    
    // Generate random password
    const password = generatePassword();
    const hashedPassword = await hashPassword(password);
    const userId = createId();

    // Start transaction
    await sql`BEGIN`;

    try {
      // Create user account
      await db.insert(users).values({
        id: userId,
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: "user",
      });

      // Create team member record
      const teamMemberResult = await sql`
        INSERT INTO team_members (
          name,
          email,
          role,
          department,
          phone,
          status,
          admin_id,
          user_id
        ) VALUES (
          ${body.name},
          ${body.email},
          ${body.role},
          ${body.department || null},
          ${body.phone || null},
          ${body.status},
          ${session.user.id},
          ${userId}
        )
        RETURNING id
      `;

      await sql`COMMIT`;

      // Send welcome email
      const emailSent = await sendWelcomeEmail(
        body.email,
        body.name,
        password
      );

      return NextResponse.json({ 
        id: teamMemberResult.rows[0].id,
        ...body,
        temporaryPassword: password,
        emailSent
      }, { status: 201 });

    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
    
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