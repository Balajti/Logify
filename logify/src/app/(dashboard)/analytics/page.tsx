'use client';

import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { ProjectMetrics } from '@/components/analytics/project-metrics';
import { TimeDistribution } from '@/components/dashboard/time-distribution';
import { TrendChart } from '@/components/analytics/trend-chart';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useEffect } from 'react';
import { fetchDashboardData, fetchProjects, selectActiveProjectIds, selectActivities, selectDashboardStats, selectOverdueTasks, selectTimeDistribution } from '@/lib/redux/features/projects/projectsSlice';
import { fetchTimesheetEntries, selectTimesheetSummary } from '@/lib/redux/features/timesheet/timesheetSlice';
import { TeamPerformance } from '@/components/analytics/team-performance';

export default function AnalyticsPage() {

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchTimesheetEntries({}));
    dispatch(fetchProjects());
  }, [dispatch]);

  const stats = useAppSelector(selectDashboardStats);
  const timeDistribution = useAppSelector(selectTimeDistribution);
  const activities = useAppSelector(selectActivities);
  const activeProjects = useAppSelector(selectActiveProjectIds);
  const timesheetSummary = useAppSelector(selectTimesheetSummary);
  const overdueTasks = useAppSelector(selectOverdueTasks);


  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        
        <ProjectMetrics 
          totalHours={stats?.totalHours.value} 
          completed={stats?.completedTasks.value} 
          activeProjects={activeProjects.length} 
          overdueTasks={overdueTasks} 
        />
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <TimeDistribution data={timeDistribution} />
          <TeamPerformance />
        </div>
      </div>
    </DashboardWrapper>
  );
}