import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check for authenticated user
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin_id = session.user.admin_id || session.user.id;
    const teamMemberId = Number(params.id);

    // Validate teamMemberId
    if (isNaN(teamMemberId)) {
      return NextResponse.json({ error: 'Invalid team member ID' }, { status: 400 });
    }

    // Verify team member exists and belongs to the admin
    const memberCheck = await sql`
      SELECT admin_id FROM team_members WHERE id = ${teamMemberId}
    `;

    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    if (memberCheck.rows[0].admin_id !== admin_id) {
      return NextResponse.json({ error: 'Not authorized to delete this team member' }, { status: 403 });
    }

    // Delete related records from task_team_members
    await sql`
      DELETE FROM task_team_members WHERE team_member_id = ${teamMemberId}
    `;

    // Delete the team member
    await sql`
      DELETE FROM team_members WHERE id = ${teamMemberId}
    `;

    return NextResponse.json({ success: true, message: 'Team member deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete team member:', error);
    return NextResponse.json(
      { error: 'Failed to delete team member', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
