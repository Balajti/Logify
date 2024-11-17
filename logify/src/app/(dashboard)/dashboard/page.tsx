'use client';

import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { useAppSelector } from '@/lib/redux/hooks';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { TimeDistribution } from '@/components/dashboard/time-distribution';
import { ActiveProjects } from '@/components/dashboard/active-projects';
import { Clock, Users, Briefcase, CheckSquare } from 'lucide-react';
import React from 'react';

export default function DashboardPage() {
  const { stats, timeDistribution, activities, activeProjects } = useAppSelector(
    (state) => state.projects
  );

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

        {/* Charts and Activity */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <TimeDistribution data={timeDistribution} />
          <ActiveProjects projectIds={activeProjects} />
          <RecentActivity activities={activities} />
        </div>
      </div>
    </DashboardWrapper>
  );
}