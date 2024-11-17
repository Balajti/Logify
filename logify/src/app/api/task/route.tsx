import { sql, db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { QueryResult } from '@vercel/postgres';

// Type for task insert result
interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: Date | null;
  is_completed: boolean;
  project_id: number;
}

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['to-do', 'in-progress', 'completed']).default('to-do'),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional(),
  project_id: z.number(),
  assigned_members: z.array(z.number()).optional()
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = createTaskSchema.parse(json);

    // Begin transaction
    await sql`BEGIN`;

    try {
      // Insert the task
      const taskResult: QueryResult<TaskRow> = await sql`
        INSERT INTO tasks (
          title, 
          description, 
          status, 
          priority, 
          due_date, 
          project_id
        )
        VALUES (
          ${body.title},
          ${body.description},
          ${body.status},
          ${body.priority},
          ${body.due_date},
          ${body.project_id}
        )
        RETURNING *
      `;

      const newTask = taskResult.rows[0];

      // If there are team members to assign, insert them
      if (body.assigned_members?.length) {
        await Promise.all(
          body.assigned_members.map((memberId) =>
            sql`
              INSERT INTO task_team_members (task_id, team_member_id)
              VALUES (${newTask.id}, ${memberId})
            `
          )
        );
      }

      // Commit transaction
      await sql`COMMIT`;

      return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
      // Rollback on error
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