'use client';

import { format, addDays } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TimesheetSummaryProps {
  startDate: Date;
}

export function TimesheetSummary({ startDate }: TimesheetSummaryProps) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  
  // Mock data - in real app, this would be calculated from actual entries
  const dailyTotals = {
    [format(weekDays[0], 'yyyy-MM-dd')]: 8,
    [format(weekDays[1], 'yyyy-MM-dd')]: 7.5,
    // Add more days...
  };

  const weeklyTotal = Object.values(dailyTotals).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Weekly Total</CardTitle>
          <CardDescription>Total hours for the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weeklyTotal} hrs</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Daily Average</CardTitle>
          <CardDescription>Average hours per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(weeklyTotal / 5).toFixed(1)} hrs
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Billable Hours</CardTitle>
          <CardDescription>Total billable time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weeklyTotal * 0.9} hrs</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Status</CardTitle>
          <CardDescription>Timesheet submission status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500">Pending</div>
        </CardContent>
      </Card>
    </div>
  );
}