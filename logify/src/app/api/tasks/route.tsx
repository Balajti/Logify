import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface TaskRow {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  project_id: number;
  admin_id: string;
  is_completed: boolean;
}

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['to-do', 'in-progress', 'completed']).default('to-do'),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  projectId: z.number(),
  assignedTo: z.array(z.number()).optional()
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin_id = session.user.admin_id || session.user.id;

    const tasks = await sql`
      SELECT t.*,
        COUNT(DISTINCT ttm.team_member_id) as assigned_count,
        p.name as project_name
      FROM tasks t
      LEFT JOIN task_team_members ttm ON t.id = ttm.task_id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.admin_id = ${admin_id}
      GROUP BY t.id, p.name
      ORDER BY t.id DESC
    `;

    return NextResponse.json(tasks.rows);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
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
    const body = createTaskSchema.parse(json);

    await sql`BEGIN`;

    try {
      // Verify the project belongs to this admin
      const projectCheck = await sql`
        SELECT COUNT(*) as count 
        FROM projects 
        WHERE id = ${body.projectId} 
        AND admin_id = ${admin_id}
      `;

      if (projectCheck.rows[0].count === 0) {
        await sql`ROLLBACK`;
        return NextResponse.json(
          { error: 'Project not found or unauthorized' },
          { status: 404 }
        );
      }

      // Insert the task
      const result = await sql`
        INSERT INTO tasks (
          title,
          description,
          status,
          priority,
          due_date,
          project_id,
          admin_id,
          is_completed
        )
        VALUES (
          ${body.title},
          ${body.description || null},
          ${body.status},
          ${body.priority},
          ${body.dueDate || null},
          ${body.projectId},
          ${admin_id},
          ${body.status === 'completed'}
        )
        RETURNING *
      `;

      // If there are team members to assign
      if (body.assignedTo?.length) {
        await Promise.all(
          body.assignedTo.map(memberId => sql`
            INSERT INTO task_team_members (task_id, team_member_id)
            VALUES (${result.rows[0].id}, ${memberId})
          `)
        );
      }

      await sql`COMMIT`;
      return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error('Failed to create task:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}