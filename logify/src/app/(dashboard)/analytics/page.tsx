'use client';

import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { ProjectMetrics } from '@/components/analytics/project-metrics';
import { TimeDistribution } from '@/components/analytics/time-distribution';
import { TrendChart } from '@/components/analytics/trend-chart';

export default function AnalyticsPage() {
  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        
        <ProjectMetrics />
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <TimeDistribution />
          <TrendChart />
        </div>
      </div>
    </DashboardWrapper>
  );
}