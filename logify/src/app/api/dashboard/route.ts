// app/api/dashboard/route.ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sql`BEGIN`;
    try {
      // Get projects statistics
      const projectsStats = await sql`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(*) FILTER (WHERE status = 'in-progress') as active_projects,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_projects
        FROM projects
      `;
      // Get tasks statistics
      const tasksStats = await sql`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
          COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_tasks
        FROM tasks
      `;
      // Get team members count
      const teamStats = await sql`
        SELECT COUNT(*) as total_members
        FROM team_members
      `;
      // Calculate total hours from timesheet
      const hoursStats = await sql`
        SELECT COALESCE(SUM(hours), 0) as total_hours
        FROM timesheet
      `;
      // Get active projects (limited to 5)
      const activeProjects = await sql`
        SELECT id 
        FROM projects 
        WHERE status = 'in-progress'
        LIMIT 5
      `;
      await sql`COMMIT`;
      // Prepare the dashboard data
      const dashboardData = {
        stats: {
          totalHours: {
            value: Number(hoursStats.rows[0].total_hours),
            trend: { value: 12, isPositive: true } // Mock trend data
          },
          activeProjects: {
            value: Number(projectsStats.rows[0].active_projects),
            trend: { value: 2, isPositive: true } // Mock trend data
          },
          completedTasks: {
            value: Number(tasksStats.rows[0].completed_tasks),
            trend: { value: 8, isPositive: true } // Mock trend data
          },
          teamMembers: {
            value: Number(teamStats.rows[0].total_members),
            trend: { value: 3, isPositive: true } // Mock trend data
          }
        },
        // Mock time distribution data since we don't have category information
        timeDistribution: [
          { name: 'Development', value: 45 },
          { name: 'Meetings', value: 20 },
          { name: 'Planning', value: 15 },
          { name: 'Research', value: 20 }
        ],
        // Mock activities since we don't have an activities log table
        activities: [
          {
            id: '1',
            type: 'task',
            description: 'completed a task',
            timestamp: '2 hours ago',
            user: { 
              name: 'Team Member', 
              avatar: null 
            }
          },
          {
            id: '2',
            type: 'project',
            description: 'updated project status',
            timestamp: '3 hours ago',
            user: { 
              name: 'Team Member', 
              avatar: null 
            }
          }
        ],
        activeProjects: activeProjects.rows.map(row => row.id)
      };
      return NextResponse.json(dashboardData);
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}