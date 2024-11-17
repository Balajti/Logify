import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { QueryResult } from '@vercel/postgres';
import { config } from 'dotenv';

config();

interface TaskRow {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  project_id: number;
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

export async function GET() {
  console.log('Fetching tasks...');
  try {
    const tasks: QueryResult<TaskRow> = await sql`
      SELECT * FROM tasks
    `;
    console.log('Tasks fetched successfully');
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
  console.log('Creating task...');
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
          ${body.dueDate},
          ${body.projectId}
        )
        RETURNING *
      `;
      const newTask = taskResult.rows[0];
      console.log('Task created successfully:', newTask);
      // If there are team members to assign, insert them
      if (body.assignedTo?.length) {
        await Promise.all(
          body.assignedTo.map((memberId) =>
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
      console.error('Failed to create task, rolling back:', error);
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