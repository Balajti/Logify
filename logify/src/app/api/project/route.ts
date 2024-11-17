import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { QueryResult } from '@vercel/postgres';

interface ProjectRow {
  id: number;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  start_date: Date | null;
  end_date: Date | null;
  due_date: Date | null;
  progress: number;
  task_total: number;
  task_completed: number;
}

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['not-started', 'in-progress', 'on-hold', 'completed', 'undefined'])
    .default('undefined'),
  priority: z.enum(['low', 'medium', 'high']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  due_date: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  team_members: z.array(z.number()).optional()
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = createProjectSchema.parse(json);

    // Begin transaction
    await sql`BEGIN`;

    try {
      // Insert the project
      const projectResult: QueryResult<ProjectRow> = await sql`
        INSERT INTO projects (
          name, 
          description, 
          status, 
          priority, 
          start_date, 
          end_date, 
          due_date, 
          progress
        )
        VALUES (
          ${body.name},
          ${body.description},
          ${body.status},
          ${body.priority},
          ${body.start_date},
          ${body.end_date},
          ${body.due_date},
          ${body.progress ?? 0}
        )
        RETURNING *
      `;

      const newProject = projectResult.rows[0];

      // If there are team members to assign, insert them
      if (body.team_members?.length) {
        await Promise.all(
          body.team_members.map((memberId) =>
            sql`
              INSERT INTO project_team_members (project_id, team_member_id)
              VALUES (${newProject.id}, ${memberId})
            `
          )
        );
      }

      // Commit transaction
      await sql`COMMIT`;

      return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
      // Rollback on error
      await sql`ROLLBACK`;
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