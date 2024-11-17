'use client';

import { useState } from 'react';
import { addDays, format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { SubmitTimesheetDialog } from './submit-timesheet-dialog';
import { TimesheetEntry } from '@/lib/redux/features/timesheet/timesheetSlice';
import { Task } from '@/lib/redux/features/tasks/tasksSlice';

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  hours: { [key: string]: string };
  total: number;
}

interface TimesheetTableProps {
  startDate: Date;
  entries: TimesheetEntry[];
  employeeId?: string;
  isAdminView?: boolean;
}

const projectTasks: { [key: string]: string[] } = {
  'website-redesign': ['UI Development', 'Backend Integration', 'Testing'],
  'mobile-app': ['App Development', 'API Integration', 'QA'],
  'api-integration': ['API Design', 'Implementation', 'Documentation'],
};

export function TimesheetTable({ 
  startDate, 
  entries, 
  employeeId, 
  isAdminView = false 
}: TimesheetTableProps) {
  console.log('TimesheetTable:', startDate, employeeId, isAdminView);
  const [localEntries, setLocalEntries] = useState<TimeEntry[]>(entries.map(entry => ({
    id: entry.id.toString(),
    project: '',
    task: '',
    hours: {},
    total: 0,
  })));
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const addNewEntry = () => {
    const newEntry: TimeEntry = {
      id: `entry-${localEntries.length + 1}`,
      project: '',
      task: '',
      hours: {},
      total: 0,
    };
    setLocalEntries([...localEntries, newEntry]);
  };
  const removeEntry = (id: string) => {
    setLocalEntries(localEntries.filter(entry => entry.id !== id));
  };
  const updateEntry = (id: string, field: string, value: string) => {
    setLocalEntries(localEntries.map(entry => {
      if (entry.id === id) {
        if (field === 'project') {
          return { ...entry, project: value, task: '' };
        }
        return { ...entry, [field]: value };
      }
      return entry;
    }));
  };
  const updateHours = (id: string, date: string, value: string) => {
    setLocalEntries(localEntries.map(entry => {
      if (entry.id === id) {
        const newHours = { ...entry.hours, [date]: value };
        const total = Object.values(newHours)
          .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        return { ...entry, hours: newHours, total };
      }
      return entry;
    }));
  };
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Project</TableHead>
            <TableHead className="w-[200px]">Task</TableHead>
            {weekDays.map(day => (
              <TableHead key={day.toString()} className="text-center">
                <div>{format(day, 'EEE')}</div>
                <div className="text-xs text-muted-foreground">
                  {format(day, 'MMM d')}
                </div>
              </TableHead>
            ))}
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localEntries.map(entry => (
            <TableRow key={entry.id}>
              <TableCell>
                <Select
                  value={entry.project}
                  onValueChange={(value) => updateEntry(entry.id, 'project', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website-redesign">Website Redesign</SelectItem>
                    <SelectItem value="mobile-app">Mobile App</SelectItem>
                    <SelectItem value="api-integration">API Integration</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={entry.task}
                  onValueChange={(value) => updateEntry(entry.id, 'task', value)}
                  disabled={!entry.project}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    {entry.project && projectTasks[entry.project].map(task => (
                      <SelectItem key={task} value={task}>{task}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              {weekDays.map(day => (
                <TableCell key={day.toString()} className="text-center">
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    className="w-16 text-center mx-auto"
                    value={entry.hours[format(day, 'yyyy-MM-dd')] || ''}
                    onChange={(e) => updateHours(
                      entry.id,
                      format(day, 'yyyy-MM-dd'),
                      e.target.value
                    )}
                  />
                </TableCell>
              ))}
              <TableCell className="text-center font-medium">
                {entry.total}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between">
        <Button onClick={addNewEntry} className="gap-2">
          <Plus className="h-4 w-4" /> Add Entry
        </Button>
        <SubmitTimesheetDialog
          open={showSubmitDialog}
          onClose={() => setShowSubmitDialog(false)}
          onSubmit={() => {
            console.log('Submitting timesheet:', localEntries);
            setShowSubmitDialog(false);
          }}
        />
      </div>
    </div>
  );
}