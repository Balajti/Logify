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
import { 
  fetchTimesheetEntries, 
  selectFilteredEntries, 
  setSelectedEmployee,
  selectSelectedEmployee,
  setTimesheetFilters 
} from '@/lib/redux/features/timesheet/timesheetSlice';
import { fetchProjects } from '@/lib/redux/features/projects/projectsSlice';
import { fetchTasks } from '@/lib/redux/features/tasks/tasksSlice';

export function AdminTimesheetView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllTeamMembers);
  const selectedEmployee = useAppSelector(selectSelectedEmployee);
  const timesheetEntries = useAppSelector(selectFilteredEntries);

  // Only fetch team members once on mount
  useEffect(() => {
    dispatch(fetchTeamMembers());
    dispatch(fetchProjects());
    dispatch(fetchTasks());
  }, []);

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const handleEmployeeChange = (value: string) => {
    const employeeId = Number(value);
    
    // Update both selected employee and filters
    dispatch(setSelectedEmployee(employeeId));
    dispatch(setTimesheetFilters({ team_member_id: employeeId }));
    
    // Fetch new entries
    dispatch(fetchTimesheetEntries({ team_member_id: employeeId }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Timesheets</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePreviousWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select 
              defaultValue={selectedEmployee?.toString()} 
              onValueChange={handleEmployeeChange}
            >
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
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {selectedEmployee ? (
        <TimesheetTable 
          startDate={weekStart}
          entries={timesheetEntries}
          employeeId={String(selectedEmployee)} 
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