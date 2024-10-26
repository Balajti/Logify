'use client';

import { ProjectMetrics } from '@/components/analytics/project-metrics';
import { TeamPerformance } from '@/components/analytics/team-performance';
import { TimeDistribution } from '@/components/analytics/time-distribution';
import { TrendChart } from '@/components/analytics/trend-chart';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';

export default function AnalyticsPage() {
  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <ProjectMetrics />
        <div className="grid gap-6 md:grid-cols-2">
          <TimeDistribution />
          <TeamPerformance />
        </div>
        <TrendChart />
      </div>
    </DashboardWrapper>
  );
}