import { authOptions } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

// Handle GET requests (already implemented)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin_id = session.user.admin_id || session.user.id;
    const { searchParams } = new URL(request.url);

    const conditions: string[] = [];
    const values: any[] = [];

    conditions.push(`t.admin_id = $1`);
    values.push(admin_id);

    let paramCount = 2;

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

    const result = await sql.query(query, values);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch timesheet entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timesheet entries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle POST requests to create a new entry
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin_id = session.user.admin_id || session.user.id;
    const body = await request.json();


    // Validate required fields
    if (!body.team_member_id || !body.project_id || !body.task_id || !body.date || body.hours == null || !body.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const query = `
      INSERT INTO timesheet (
        team_member_id, project_id, task_id, date, hours, description, admin_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      body.team_member_id,
      body.project_id,
      body.task_id,
      body.date,
      body.hours,
      body.description,
      admin_id,
    ];

    const result = await sql.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create timesheet entry:", error);
    return NextResponse.json(
      { error: "Failed to create timesheet entry", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
