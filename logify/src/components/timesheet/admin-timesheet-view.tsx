'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimesheetTable } from './timesheet-table';
import { startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const mockEmployees = [
  { id: '2', name: 'Demo Employee' },
  { id: '3', name: 'John Doe' },
  { id: '4', name: 'Jane Smith' },
];

export function AdminTimesheetView() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  //const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

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
                {mockEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
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