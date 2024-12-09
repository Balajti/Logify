'use client';

import { use, useEffect, useState } from 'react';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { TimesheetHeader } from '@/components/timesheet/timesheet-header';
import { TimesheetEntry, TimesheetTable } from '@/components/timesheet/timesheet-table';
import { AdminTimesheetView } from '@/components/timesheet/admin-timesheet-view';
import { useAuthorization } from '@/hooks/use-authorization';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchTimesheetEntries, selectAllTimesheetEntries, selectSelectedEmployee, selectTimesheetStatus, setSelectedEmployee } from '@/lib/redux/features/timesheet/timesheetSlice';
import { startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { fetchTeamMembers, selectAllTeamMembers } from '@/lib/redux/features/team/teamSlice';
import { fetchTasks } from '@/lib/redux/features/tasks/tasksSlice';
import { fetchProjects } from '@/lib/redux/features/projects/projectsSlice';
import { useSession } from 'next-auth/react';

export default function TimesheetPage() {
  const { isAdmin, userId } = useAuthorization();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);
  const timesheetEntries = useAppSelector(selectAllTimesheetEntries);
  const status = useAppSelector(selectTimesheetStatus);
  const [currentDate, setCurrentDate] = useState(new Date());
  const session = useSession();
  const team_members = useAppSelector(selectAllTeamMembers) || [];
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  
  let timesheetEntry: TimesheetEntry[] = [];

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
    if (isAdmin) {
      dispatch(fetchTimesheetEntries({}));
    } else {
      const employee = team_members.find((member) => member.user_id === session.data?.user.id)?.id.toString();
      setEmployeeId(employee);
      dispatch(fetchTimesheetEntries({ team_member_id: Number(employeeId) }));
    }
  }, [dispatch, isAdmin]);

  if(!isAdmin) {
    timesheetEntry = [];
        timesheetEntries.forEach((entry) => {
          if(entry.team_member_name === session.data.user.name) {
            timesheetEntry.push(entry);
          }
    });
  }

  if (status === 'loading') {
    return <div>Loading...</div>;
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
            <TimesheetTable startDate={weekStart} entries={timesheetEntry} employeeId={employeeId} isAdminView={!isAdmin}/>
          </>
        )}
      </div>
    </DashboardWrapper>
  );
}