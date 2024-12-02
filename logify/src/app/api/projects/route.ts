import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parse, format } from 'date-fns';

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['not-started', 'in-progress', 'on-hold', 'completed', 'undefined']),
  priority: z.enum(['low', 'medium', 'high']),
  startDate: z.string(),
  endDate: z.string(),
  dueDate: z.string().optional(),
  progress: z.number().min(0).max(100),
  team: z.array(z.number()).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin_id = session.user.admin_id || session.user.id;
    
    const projects = await sql`
      SELECT 
        p.*,
        COALESCE(COUNT(DISTINCT ptm.team_member_id), 0) as team_count
      FROM projects p
      LEFT JOIN project_team_members ptm ON p.id = ptm.project_id
      WHERE p.admin_id = ${admin_id}
      GROUP BY 
        p.id, 
        p.name, 
        p.description, 
        p.status, 
        p.priority,
        p.start_date,
        p.end_date,
        p.due_date,
        p.progress,
        p.task_total,
        p.task_completed,
        p.admin_id
      ORDER BY p.id DESC
    `;

    return NextResponse.json(projects.rows);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    const err = error as Error;
    return NextResponse.json(
      { 
        error: 'Failed to fetch projects',
        details: err.message
      },
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
    console.log('Received data:', json); // Debug log
    
    const body = createProjectSchema.parse(json);
    
    // Format dates for PostgreSQL
    const formatDateForDB = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        return format(date, 'yyyy-MM-dd');
      } catch (error) {
        console.error('Date parsing error:', error);
        throw new Error('Invalid date format');
      }
    };

    await sql`BEGIN`;
    
    try {
      const projectResult = await sql`
        INSERT INTO projects (
          name, 
          description, 
          status, 
          priority, 
          start_date, 
          end_date, 
          due_date,
          admin_id
        )
        VALUES (
          ${body.name},
          ${body.description || ''},
          ${body.status},
          ${body.priority},
          ${formatDateForDB(body.startDate)},
          ${formatDateForDB(body.endDate)},
          ${body.dueDate ? formatDateForDB(body.dueDate) : formatDateForDB(body.endDate)},
          ${admin_id}
        )
        RETURNING *
      `;

      const newProject = projectResult.rows[0];
      console.log('Created project:', newProject); // Debug log

      if (body.team?.length) {
        await Promise.all(
          body.team.map((memberId) =>
            sql`
              INSERT INTO project_team_members (project_id, team_member_id)
              VALUES (${newProject.id}, ${memberId})
            `
          )
        );
      }

      await sql`COMMIT`;
      
      return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
      await sql`ROLLBACK`;
      console.error('SQL Error:', error); // Debug log
      throw error;
    }
  } catch (error) {
    console.error('Failed to create project:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}