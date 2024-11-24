'use client';

import { useEffect, useState } from 'react';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { TimesheetHeader } from '@/components/timesheet/timesheet-header';
import { TimesheetTable } from '@/components/timesheet/timesheet-table';
import { AdminTimesheetView } from '@/components/timesheet/admin-timesheet-view';
import { useAuthorization } from '@/hooks/use-authorization';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchTimesheetEntries, selectAllTimesheetEntries, selectTimesheetStatus } from '@/lib/redux/features/timesheet/timesheetSlice';
import { startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

export default function TimesheetPage() {
  const { isAdmin, userId } = useAuthorization();
  const dispatch = useAppDispatch();
  const timesheetEntries = useAppSelector(selectAllTimesheetEntries);
  const status = useAppSelector(selectTimesheetStatus);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchTimesheetEntries({}));
    } else {
      
      const employeeId = 1;
      dispatch(fetchTimesheetEntries({ team_member_id: userId }));
    }
  }, [dispatch, isAdmin]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Failed to load timesheet entries</div>;
  }

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
            <TimesheetTable startDate={weekStart} entries={timesheetEntries} employeeId={userId} />
          </>
        )}
      </div>
    </DashboardWrapper>
  );
}