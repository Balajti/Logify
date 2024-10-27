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

export function ProjectMetrics() {
  const metrics = [
    {
      title: 'Total Hours Logged',
      value: '164.2',
      change: '+12.3%',
      isPositive: true,
      icon: Clock,
    },
    {
      title: 'Tasks Completed',
      value: '48',
      change: '+8.2%',
      isPositive: true,
      icon: CheckSquare,
    },
    {
      title: 'Active Projects',
      value: '12',
      change: '+15.1%',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Overdue Tasks',
      value: '3',
      change: '-5.1%',
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