'use client';

import { useState } from 'react';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { TimesheetHeader } from '@/components/timesheet/timesheet-header';
import { TimesheetTable } from '@/components/timesheet/timesheet-table';
import { AdminTimesheetView } from '@/components/timesheet/admin-timesheet-view';
import { useAuthorization } from '@/hooks/use-authorization';
import { startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

export default function TimesheetPage() {
  const { isAdmin } = useAuthorization();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {isAdmin ? (
          <AdminTimesheetView />
        ) : (
          <>
            <TimesheetHeader
              startDate={weekStart}
              endDate={weekEnd}
              onPrevious={handlePreviousWeek}
              onNext={handleNextWeek}
            />
            <TimesheetTable startDate={weekStart} />
          </>
        )}
      </div>
    </DashboardWrapper>
  );
}