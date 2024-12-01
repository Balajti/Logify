import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { QueryResult } from '@vercel/postgres';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectAdminId } from '@/lib/redux/features/auth/authSlice';

interface TeamMemberRow {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
  admin_id: string;
  user_id: string;
}

const createTeamMemberSchema = z.object({
  name: z.string().min(1).max(255),
  role: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  avatar: z.string().max(255).optional(),
  status: z.enum(['active', 'away', 'offline']).default('offline'),
  user_id: z.string().optional()
});


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin_id = searchParams.get('admin_id') || searchParams.get('userId');
    console.log('admin_id', admin_id);
    const session = await getServerSession(authOptions);
    console.log('session', session);

    if (!admin_id) {
      return NextResponse.json({ error: 'admin_id is required' }, { status: 400 });
    }

    console.log('Fetching team members for user:', admin_id);
    
    const result = await sql`
      SELECT 
        tm.*,
        COUNT(DISTINCT ptm.project_id) as project_count,
        COUNT(DISTINCT ttm.task_id) as task_count
      FROM team_members tm
      LEFT JOIN project_team_members ptm ON tm.id = ptm.team_member_id
      LEFT JOIN task_team_members ttm ON tm.id = ttm.team_member_id
      WHERE tm.admin_id = ${admin_id}
      GROUP BY 
        tm.id,
        tm.name,
        tm.role,
        tm.department,
        tm.email,
        tm.phone,
        tm.avatar,
        tm.status,
        tm.admin_id,
        tm.user_id
      ORDER BY tm.name ASC
    `;

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
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    const admin_id = session.user.admin_id || session.user.id;
    
    const json = await request.json();
    const body = createTeamMemberSchema.parse(json);

    await sql`BEGIN`;
    
    try {
      // Check if email already exists for this admin
      const emailCheck = await sql`
        SELECT COUNT(*) as count 
        FROM team_members 
        WHERE email = ${body.email} 
        AND admin_id = ${admin_id}
      `;

      if (emailCheck.rows[0].count > 0) {
        await sql`ROLLBACK`;
        return NextResponse.json(
          { error: 'Email already exists for this organization' },
          { status: 409 }
        );
      }

      const result: QueryResult<TeamMemberRow> = await sql`
        INSERT INTO team_members (
          name,
          role,
          department,
          email,
          phone,
          avatar,
          status,
          admin_id,
          user_id
        )
        VALUES (
          ${body.name},
          ${body.role},
          ${body.department},
          ${body.email},
          ${body.phone},
          ${body.avatar},
          ${body.status},
          ${admin_id},
          ${body.user_id}
        )
        RETURNING *
      `;

      await sql`COMMIT`;
      
      return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
      await sql`ROLLBACK`;
      console.error('Failed to create team member, rolling back:', error);
      
      if (error.code === '23505') {
        if (error.constraint === 'team_members_email_key') {
          return NextResponse.json(
            { error: 'Email already exists' },
            { status: 409 }
          );
        }
        if (error.constraint === 'team_members_user_id_key') {
          return NextResponse.json(
            { error: 'User is already a team member' },
            { status: 409 }
          );
        }
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