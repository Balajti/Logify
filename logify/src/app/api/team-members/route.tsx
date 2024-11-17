import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { QueryResult } from '@vercel/postgres';
import { config } from 'dotenv';

config();

interface TeamMemberRow {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
}

const createTeamMemberSchema = z.object({
  name: z.string().min(1).max(255),
  role: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  avatar: z.string().max(255).optional(),
  status: z.enum(['active', 'away', 'offline']).default('offline')
});

export async function GET() {
  console.log('Fetching team members...');
  try {
    const result: QueryResult<TeamMemberRow> = await sql`
      SELECT * FROM team_members 
      ORDER BY name ASC
    `;
    console.log('Team members fetched successfully');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('Creating team member...');
  try {
    const json = await request.json();
    const body = createTeamMemberSchema.parse(json);
    // Begin transaction
    await sql`BEGIN`;
    try {
      // Insert the team member
      const result: QueryResult<TeamMemberRow> = await sql`
        INSERT INTO team_members (
          name,
          role,
          department,
          email,
          phone,
          avatar,
          status
        )
        VALUES (
          ${body.name},
          ${body.role},
          ${body.department},
          ${body.email},
          ${body.phone},
          ${body.avatar},
          ${body.status}
        )
        RETURNING *
      `;
      await sql`COMMIT`;
      console.log('Team member created successfully');
      return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
      await sql`ROLLBACK`;
      console.error('Failed to create team member, rolling back:', error);
      // Check for unique email constraint violation
      if (error.code === '23505' && error.constraint === 'team_members_email_key') {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to create team member:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}