'use client';

import { useState } from 'react';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { TimesheetHeader } from '@/components/timesheet/timesheet-header';
import { TimesheetTable } from '@/components/timesheet/timesheet-table';
import { TimesheetSummary } from '@/components/timesheet/timesheet-summary';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

export default function TimesheetPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start week on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <TimesheetHeader
          startDate={weekStart}
          endDate={weekEnd}
          onPrevious={handlePreviousWeek}
          onNext={handleNextWeek}
        />
        <TimesheetTable startDate={weekStart} />
        <TimesheetSummary startDate={weekStart} />
      </div>
    </DashboardWrapper>
  );
}