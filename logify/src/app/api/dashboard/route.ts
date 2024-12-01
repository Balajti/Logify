import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin_id = session.user.admin_id || session.user.id;

    // Execute all queries in parallel for better performance
    const [
      projectStats,
      taskStats,
      teamStats,
      timesheetStats,
      recentActivities,
      timeDistribution
    ] = await Promise.all([
      // Project Statistics
      sql`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as active_projects,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
          COUNT(CASE WHEN status = 'on-hold' THEN 1 END) as on_hold_projects
        FROM projects 
        WHERE admin_id = ${admin_id}
      `,

      // Task Statistics
      sql`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN status = 'to-do' AND due_date < CURRENT_DATE THEN 1 END) as overdue_tasks
        FROM tasks 
        WHERE admin_id = ${admin_id}
      `,

      // Team Statistics
      sql`
        SELECT 
          COUNT(*) as total_members,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_members,
          COUNT(CASE WHEN status = 'away' THEN 1 END) as away_members
        FROM team_members 
        WHERE admin_id = ${admin_id}
      `,

      // Timesheet Statistics
      sql`
        SELECT 
          COALESCE(SUM(hours), 0) as total_hours,
          COALESCE(AVG(hours), 0) as avg_hours_per_entry,
          COUNT(DISTINCT date) as total_days,
          COUNT(DISTINCT team_member_id) as active_members
        FROM timesheet 
        WHERE admin_id = ${admin_id}
        AND date >= CURRENT_DATE - INTERVAL '30 days'
      `,

      // Recent Activities (last 10 activities)
      sql`
        (SELECT 
          'project' as type,
          name as title,
          status,
          created_at as timestamp
        FROM projects 
        WHERE admin_id = ${admin_id}
        ORDER BY created_at DESC 
        LIMIT 5)
        UNION ALL
        (SELECT 
          'task' as type,
          title,
          status,
          created_at as timestamp
        FROM tasks 
        WHERE admin_id = ${admin_id}
        ORDER BY created_at DESC 
        LIMIT 5)
        ORDER BY timestamp DESC 
        LIMIT 10
      `,

      // Time Distribution by Project (last 30 days)
      sql`
        SELECT 
          p.name as project_name,
          COALESCE(SUM(t.hours), 0) as total_hours,
          ROUND(COALESCE(SUM(t.hours) * 100.0 / NULLIF(SUM(SUM(t.hours)) OVER (), 0), 0), 2) as percentage
        FROM projects p
        LEFT JOIN timesheet t ON p.id = t.project_id 
          AND t.date >= CURRENT_DATE - INTERVAL '30 days'
        WHERE p.admin_id = ${admin_id}
        GROUP BY p.id, p.name
        ORDER BY total_hours DESC
        LIMIT 5
      `
    ]);

    const dashboardData = {
      projects: {
        total: projectStats.rows[0].total_projects,
        active: projectStats.rows[0].active_projects,
        completed: projectStats.rows[0].completed_projects,
        onHold: projectStats.rows[0].on_hold_projects,
      },
      tasks: {
        total: taskStats.rows[0].total_tasks,
        completed: taskStats.rows[0].completed_tasks,
        inProgress: taskStats.rows[0].in_progress_tasks,
        overdue: taskStats.rows[0].overdue_tasks,
      },
      team: {
        totalMembers: teamStats.rows[0].total_members,
        activeMembers: teamStats.rows[0].active_members,
        awayMembers: teamStats.rows[0].away_members,
      },
      timesheet: {
        totalHours: Number(timesheetStats.rows[0].total_hours),
        avgHoursPerDay: Number(timesheetStats.rows[0].avg_hours_per_entry),
        totalDays: timesheetStats.rows[0].total_days,
        activeMembersLastMonth: timesheetStats.rows[0].active_members,
      },
      recentActivities: recentActivities.rows,
      timeDistribution: timeDistribution.rows,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}