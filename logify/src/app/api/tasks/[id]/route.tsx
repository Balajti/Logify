import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin_id = session.user.admin_id || session.user.id;
  const taskId = Number(params.id);

  if (isNaN(taskId)) {
    return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
  }

  try {
    // Check if the task exists and belongs to the current admin
    const taskCheck = await sql`
      SELECT admin_id FROM tasks WHERE id = ${taskId}
    `;

    if (taskCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (taskCheck.rows[0].admin_id !== admin_id) {
      return NextResponse.json({ error: 'Not authorized to delete this task' }, { status: 403 });
    }

    // Delete from the relation table first to avoid foreign key constraint issues
    await sql`
      DELETE FROM task_team_members WHERE task_id = ${taskId}
    `;

    // Then delete the task itself
    await sql`
      DELETE FROM tasks WHERE id = ${taskId}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
