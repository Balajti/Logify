'use client';

import { useEffect, useState } from 'react';
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
import { Plus, Trash2, Save } from 'lucide-react';
import { SubmitTimesheetDialog } from './submit-timesheet-dialog';
import { 
  TimesheetEntry,
  createTimesheetEntry,
  updateTimesheetEntry,
  deleteTimesheetEntry 
} from '@/lib/redux/features/timesheet/timesheetSlice';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { selectAllProjects, Project } from '@/lib/redux/features/projects/projectsSlice';
import { selectAllTasks, Task } from '@/lib/redux/features/tasks/tasksSlice';

// Interfaces
interface TimesheetTableProps {
  startDate: Date;
  entries: TimesheetEntry[];
  employeeId?: string;
  isAdminView?: boolean;
}

interface TimesheetEntryForPage {
  id: number;
  team_member_id: number;
  project_id: number;
  task_id: number;
  date: string;
  hours: number;
  description: string;
  created_at: string;
  project_name?: string;
  task_title?: string;
}

interface TimesheetDates {
  id: number;
  date: string;
  hours: number;
}

interface PendingChange {
  project_id?: number;
  task_id?: number;
  hours?: { [date: string]: number };
}

export function TimesheetTable({ 
  startDate, 
  entries,
  employeeId,
  isAdminView,
}: TimesheetTableProps) {
  // Hooks
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectAllProjects);
  const tasks = useAppSelector(selectAllTasks);
  
  // State
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const [localEntries, setLocalEntries] = useState<TimesheetEntryForPage[]>([]);
  const [timesheetDates, setTimesheetDates] = useState<TimesheetDates[]>([]);
  const [pendingChanges, setPendingChanges] = useState<{
    [entryId: number]: PendingChange;
  }>({});

  // Initialize data
  useEffect(() => {
    const entriesWithNames = entries.map(entry => ({
      ...entry,
    }));
    setLocalEntries(entriesWithNames.filter(entry => weekDays.find(day => format(day, 'yyyy-MM-dd') === entry.date.split("T")[0])));
    //setLocalEntries(entriesWithNames);

    
    const dates = entries.map((entry, id) => ({
      id,
      date: entry.date.split("T")[0],
      hours: entry.hours
    }));
    setTimesheetDates(dates);
  }, [entries]);

  if(localEntries.length === 0) {
    return <div>No entries found</div>;
  }

  // Helper functions
  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Select project';
  };

  const getTaskName = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'Select task';
  };

  const getProjectTasks = (projectId: number) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const getEntryForDate = (date: Date) => {
    return localEntries.find(entry => entry.date === format(date, 'yyyy-MM-dd'));
  };

  // Change handlers
  const handleProjectChange = (entryId: number, projectId: number) => {
    setPendingChanges(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        project_id: projectId,
        task_id: undefined
      }
    }));
    
    setLocalEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          project_id: projectId,
          project_name: getProjectName(projectId),
          task_id: 0,
          task_name: 'Select task'
        };
      }
      return entry;
    }));
  };

  const handleTaskChange = (entryId: number, taskId: number) => {
    const entry = localEntries.find(e => e.id === entryId);
    if (!entry?.project_id) return;

    setPendingChanges(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        task_id: taskId
      }
    }));

    setLocalEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          task_id: taskId,
          task_name: getTaskName(taskId)
        };
      }
      return entry;
    }));
  };

  const handleHoursChange = (entryId: number, date: string, value: string) => {
    const hours = Number(value);
    if (isNaN(hours) || hours < 0 || hours > 24) return;

    setPendingChanges(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        hours: {
          ...(prev[entryId]?.hours || {}),
          [date]: hours
        }
      }
    }));

    setTimesheetDates(prev => prev.map(d => {
      if (d.date === date) {
        return { ...d, hours };
      }
      return d;
    }));
  };

  // CRUD operations
  const saveChanges = async () => {
    for (const [entryId, changes] of Object.entries(pendingChanges)) {
      const entry = localEntries.find(e => e.id === Number(entryId));
      if (!entry) continue;

      await dispatch(updateTimesheetEntry({
        id: Number(entryId),
        data: {
          project_id: changes.project_id || entry.project_id,
          task_id: changes.task_id || entry.task_id,
          ...Object.entries(changes.hours || {}).reduce((acc, [date, hours]) => ({
            ...acc,
            date,
            hours
          }), {})
        }
      }));
    }
    setPendingChanges({});
  };

  const addNewEntry = async (date: string) => {
    if (!employeeId) return;

    const newEntry: Omit<TimesheetEntry, 'id' | 'created_at'> = {
      team_member_id: Number(employeeId),
      project_id: 0,
      task_id: 0,
      date,
      hours: 0,
      description: ''
    };

    await dispatch(createTimesheetEntry(newEntry));
  };

  const removeEntry = async (entryId: number) => {
    await dispatch(deleteTimesheetEntry(entryId));
  };

  // Calculations
  const calculateDayTotal = (date: Date) => {
    const entry = getEntryForDate(date);
    return entry?.hours || 0;
  };

  const calculateWeekTotal = () => {
    return localEntries.reduce((total, entry) => total + (Number(entry.hours) || 0), 0);
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
            {isAdminView && <TableHead className="w-[50px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {localEntries.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>
                <Select
                  value={entry.project_id.toString()}
                  onValueChange={(value) => handleProjectChange(entry.id, Number(value))}
                  disabled={!isAdminView}
                >
                  <SelectTrigger>
                    <SelectValue>{entry.project_name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={entry.task_id?.toString()}
                  onValueChange={(value) => handleTaskChange(entry.id, Number(value))}
                  disabled={!isAdminView || !entry.project_id}
                >
                  <SelectTrigger>
                    <SelectValue>{entry.task_title}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getProjectTasks(entry.project_id).map(task => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              {weekDays.map(weekDay => {
                const formattedWeekDay = format(weekDay, 'yyyy-MM-dd');
                const matchingEntry = formattedWeekDay === entry.date.split("T")[0];
                
                return (
                  <TableCell key={formattedWeekDay} className="text-center">
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      className="w-17 text-center mx-auto"
                      value={matchingEntry ? entry.hours : Number('')}
                      onChange={(e) => handleHoursChange(
                        entry.id,
                        formattedWeekDay,
                        e.target.value
                      )}
                      disabled={!isAdminView}
                    />
                  </TableCell>
                );
              })}
              <TableCell className="text-center font-medium">
                {calculateWeekTotal()}
              </TableCell>
              {isAdminView && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isAdminView && (
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              onClick={() => weekDays.forEach(day => 
                addNewEntry(format(day, 'yyyy-MM-dd'))
              )} 
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Add Entry
            </Button>
            {Object.keys(pendingChanges).length > 0 && (
              <Button onClick={saveChanges} className="gap-2 ml-2">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            )}
          </div>
          <SubmitTimesheetDialog
            open={showSubmitDialog}
            onClose={() => setShowSubmitDialog(false)}
            onSubmit={() => {
              saveChanges();
              setShowSubmitDialog(false);
            }}
          />
        </div>
      )}
    </div>
  );
}