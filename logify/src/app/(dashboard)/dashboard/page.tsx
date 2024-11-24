'use client';

import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TimeDistribution } from '@/components/dashboard/time-distribution';
import { ActiveProjects } from '@/components/dashboard/active-projects';
import { Clock, Users, Briefcase, CheckSquare } from 'lucide-react';
import React, { useEffect } from 'react';
import {
  selectDashboardStats,
  selectTimeDistribution,
  selectActivities,
  selectActiveProjectIds,
  fetchDashboardData,
  fetchProjects,
} from '@/lib/redux/features/projects/projectsSlice';
import { fetchTimesheetEntries, selectTimesheetSummary } from '@/lib/redux/features/timesheet/timesheetSlice';

export default function DashboardPage() {

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


  const sampleData = [
    { name: 'Development', value: 40 },
    { name: 'Meetings', value: 20 },
    { name: 'Planning', value: 25 },
    { name: 'Other', value: 15 }
  ];

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
        title="Total Hours"
        value={stats.totalHours.value}
        description="Hours tracked this month"
        icon={Clock}
        trend={stats.totalHours.trend}
          />
          <StatsCard
        title="Active Projects"
        value={stats.activeProjects.value}
        icon={Briefcase}
        trend={stats.activeProjects.trend}
          />
          <StatsCard
        title="Completed Tasks"
        value={stats.completedTasks.value}
        description="Tasks completed this week"
        icon={CheckSquare}
        trend={stats.completedTasks.trend}
          />
          <StatsCard
        title="Team Members"
        value={stats.teamMembers.value}
        icon={Users}
        trend={stats.teamMembers.trend}
          />
        </div>

        <div className="flex items-center space-x-6">
          {/* Time Distribution */}
          <div className="w-1/2">
            <TimeDistribution data={timeDistribution} />
          </div>

          {/* Active Projects */}
          <div className="w-1/2">
            <ActiveProjects projectIds={activeProjects} />
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}