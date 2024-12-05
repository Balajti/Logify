import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin_id = session.user.admin_id || session.user.id;
  const projectId = Number(params.id);

  if (isNaN(projectId)) {
    return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
  }

  try {
    // Check if the project exists and belongs to the current admin
    const projectCheck = await sql`
      SELECT admin_id FROM projects WHERE id = ${projectId}
    `;

    if (projectCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (projectCheck.rows[0].admin_id !== admin_id) {
      return NextResponse.json({ error: 'Not authorized to delete this project' }, { status: 403 });
    }

    // Remove related records to avoid foreign key constraint issues
    // Delete tasks associated with the project
    // (Their task_team_members will be deleted automatically if ON DELETE CASCADE is set,
    // otherwise you need to delete them explicitly before deleting tasks)
    await sql`DELETE FROM tasks WHERE project_id = ${projectId}`;

    // Delete project_team_members
    await sql`DELETE FROM project_team_members WHERE project_id = ${projectId}`;

    // Finally, delete the project itself
    await sql`DELETE FROM projects WHERE id = ${projectId}`;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
