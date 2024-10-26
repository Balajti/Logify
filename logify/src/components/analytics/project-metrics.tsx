'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckSquare, 
  AlertTriangle 
} from 'lucide-react';

export function ProjectMetrics() {
  const metrics = [
    {
      title: 'Total Hours Logged',
      value: '1,234',
      change: '+12.3%',
      isPositive: true,
      icon: Clock,
    },
    {
      title: 'Tasks Completed',
      value: '156',
      change: '+8.2%',
      isPositive: true,
      icon: CheckSquare,
    },
    {
      title: 'Overdue Tasks',
      value: '23',
      change: '-5.1%',
      isPositive: false,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <p className={`text-xs ${
                metric.isPositive ? 'text-green-600' : 'text-red-600'
              } flex items-center`}>
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