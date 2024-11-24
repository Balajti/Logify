'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckSquare, 
  AlertTriangle,
  Users 
} from 'lucide-react';

interface Metric {
    totalHours: number;
    completed: number;
    activeProjects: number;
    overdueTasks: number;
}

export function ProjectMetrics({totalHours, completed, activeProjects, overdueTasks}: Metric) {
  const metrics = [
    {
      title: 'Total Hours Logged',
      value: totalHours,
      change: '0%',
      isPositive: true,
      icon: Clock,
    },
    {
      title: 'Tasks Completed',
      value: completed,
      change: '0%',
      isPositive: false,
      icon: CheckSquare,
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      change: '0%',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Overdue Tasks',
      value: overdueTasks,
      change: '0%',
      isPositive: true,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs flex items-center ${
                metric.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.isPositive ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}