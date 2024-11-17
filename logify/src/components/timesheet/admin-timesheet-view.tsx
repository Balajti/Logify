'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimesheetTable } from './timesheet-table';
import { startOfWeek, addWeeks, subWeeks, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { selectAllTeamMembers, fetchTeamMembers } from '@/lib/redux/features/team/teamSlice';
import { fetchTimesheetEntries, selectFilteredEntries } from '@/lib/redux/features/timesheet/timesheetSlice';

export function AdminTimesheetView() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllTeamMembers);
  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);

  useEffect(() => {
    if (selectedEmployee) {
      dispatch(fetchTimesheetEntries({ team_member_id: Number(selectedEmployee), startDate: weekStart.toISOString(), endDate: weekEnd.toISOString() }));
    }
  }, [dispatch, selectedEmployee, weekStart, weekEnd]);

  const timesheetEntries = useAppSelector(selectFilteredEntries);


  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Timesheets</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select onValueChange={(value) => setSelectedEmployee(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {selectedEmployee ? (
        <TimesheetTable 
          startDate={weekStart}
          entries={timesheetEntries}
          employeeId={selectedEmployee} 
          isAdminView={true}
        />
      ) : (
        <div className="text-center text-gray-500 py-8">
          Select an employee to view their timesheet
        </div>
      )}
    </div>
  );
}