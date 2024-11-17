import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { QueryResult } from '@vercel/postgres';

interface TimesheetRow {
  id: number;
  team_member_id: number;
  date: Date;
  hours: number;
  description: string | null;
  created_at: Date;
  project_id: number;
  task_id: number;
}

const createTimesheetSchema = z.object({
  team_member_id: z.number(),
  project_id: z.number(),
  task_id: z.number(),
  date: z.string(), // ISO date string
  hours: z.number().positive().max(24),
  description: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = createTimesheetSchema.parse(json);

    await sql`BEGIN`;

    try {
      // First verify that the task belongs to the project
      const taskCheck: QueryResult<{ count: number }> = await sql`
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE id = ${body.task_id} 
        AND project_id = ${body.project_id}
      `;

      if (taskCheck.rows[0].count === 0) {
        await sql`ROLLBACK`;
        return NextResponse.json(
          { error: 'Task does not belong to the specified project' },
          { status: 400 }
        );
      }

      // Insert the timesheet entry
      const result: QueryResult<TimesheetRow> = await sql`
        INSERT INTO timesheet (
          team_member_id,
          date,
          hours,
          description,
          project_id,
          task_id
        )
        VALUES (
          ${body.team_member_id},
          ${body.date},
          ${body.hours},
          ${body.description},
          ${body.project_id},
          ${body.task_id}
        )
        RETURNING *
      `;

      await sql`COMMIT`;

      return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
      await sql`ROLLBACK`;
      
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A timesheet entry already exists for this team member, task, and date' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to create timesheet entry:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create timesheet entry' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch timesheet entries with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const team_member_id = searchParams.get('team_member_id');
    const project_id = searchParams.get('project_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    // Build the query based on provided filters
    let baseQuery = `
      SELECT 
        t.*,
        tm.name as team_member_name,
        p.name as project_name,
        tk.title as task_title
      FROM timesheet t
      JOIN team_members tm ON t.team_member_id = tm.id
      JOIN projects p ON t.project_id = p.id
      JOIN tasks tk ON t.task_id = tk.id
      WHERE 1=1
    `;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (team_member_id) {
      conditions.push(`t.team_member_id = $${paramCount}`);
      values.push(team_member_id);
      paramCount++;
    }
    if (project_id) {
      conditions.push(`t.project_id = $${paramCount}`);
      values.push(project_id);
      paramCount++;
    }
    if (start_date) {
      conditions.push(`t.date >= $${paramCount}`);
      values.push(start_date);
      paramCount++;
    }
    if (end_date) {
      conditions.push(`t.date <= $${paramCount}`);
      values.push(end_date);
      paramCount++;
    }

    if (conditions.length > 0) {
      baseQuery += ` AND ${conditions.join(' AND ')}`;
    }
    
    baseQuery += ` ORDER BY t.date DESC, t.created_at DESC`;

    const result = await sql.query(baseQuery, values);
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('Failed to fetch timesheet entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timesheet entries' },
      { status: 500 }
    );
  }
}