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

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  hours: { [key: string]: string }; // { "2024-01-01": "8" }
  total: number;
}

interface TimesheetTableProps {
  startDate: Date;
}

export function TimesheetTable({ startDate }: TimesheetTableProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      project: 'Website Redesign',
      task: 'UI Development',
      hours: {
        [format(startDate, 'yyyy-MM-dd')]: '8',
        [format(addDays(startDate, 1), 'yyyy-MM-dd')]: '7',
        // Add more days...
      },
      total: 15,
    },
    // Add more entries...
  ]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const addNewEntry = () => {
    const newEntry: TimeEntry = {
      id: `entry-${entries.length + 1}`,
      project: '',
      task: '',
      hours: {},
      total: 0,
    };
    setEntries([...entries, newEntry]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
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
          {entries.map(entry => (
            <TableRow key={entry.id}>
              <TableCell>
                <Select value={entry.project}>
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
                <Select value={entry.task}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              {weekDays.map(day => (
                <TableCell key={day.toString()} className="text-center">
                  <Input
                    type="text"
                    className="w-16 text-center mx-auto"
                    value={entry.hours[format(day, 'yyyy-MM-dd')] || ''}
                    placeholder="0"
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
      <Button onClick={addNewEntry} className="gap-2">
        <Plus className="h-4 w-4" /> Add Entry
      </Button>
    </div>
  );
}