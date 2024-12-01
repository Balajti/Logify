import { authOptions } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log('Fetching timesheet entries...');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin_id = session.user.admin_id || session.user.id;
    const { searchParams } = new URL(request.url);
    
    // Build base query
    const conditions: string[] = [];
    const values: any[] = [];

    // Always add admin_id as the first condition
    conditions.push(`t.admin_id = $1`);
    values.push(admin_id);

    let paramCount = 2;

    // Handle numeric parameters
    const team_member_id = searchParams.get('team_member_id');
    if (team_member_id && !isNaN(Number(team_member_id))) {
      conditions.push(`t.team_member_id = $${paramCount}`);
      values.push(Number(team_member_id));
      paramCount++;
    }

    const project_id = searchParams.get('project_id');
    if (project_id && !isNaN(Number(project_id))) {
      conditions.push(`t.project_id = $${paramCount}`);
      values.push(Number(project_id));
      paramCount++;
    }

    // Handle date parameters
    if (searchParams.get('start_date')) {
      conditions.push(`t.date >= $${paramCount}`);
      values.push(searchParams.get('start_date'));
      paramCount++;
    }

    if (searchParams.get('end_date')) {
      conditions.push(`t.date <= $${paramCount}`);
      values.push(searchParams.get('end_date'));
      paramCount++;
    }

    const query = `
      SELECT 
        t.*,
        tm.name as team_member_name,
        p.name as project_name,
        tk.title as task_title
      FROM timesheet t
      JOIN team_members tm ON t.team_member_id = tm.id
      JOIN projects p ON t.project_id = p.id
      JOIN tasks tk ON t.task_id = tk.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.date DESC, t.created_at DESC
    `;

    console.log('Executing query:', query, values); // Debug log
    const result = await sql.query(query, values);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch timesheet entries:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch timesheet entries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}