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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Save, Trash2 } from 'lucide-react';
import { SubmitTimesheetDialog } from './submit-timesheet-dialog';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchDashboardData, fetchProjects, selectAllProjects } from '@/lib/redux/features/projects/projectsSlice';
import { selectAllTasks } from '@/lib/redux/features/tasks/tasksSlice';
import { selectAllTeamMembers } from '@/lib/redux/features/team/teamSlice';
import { useSession } from 'next-auth/react';

export interface TimesheetEntry {
  id: number;
  team_member_id: number;
  date: string;
  hours: number;
  description?: string;
  project_id?: number;
  task_id: number;
  team_member_name?: string;
  project_name?: string;
  task_title?: string;
}

interface TimesheetTableProps {
  startDate: Date;
  entries: TimesheetEntry[];
  employeeId?: string;
  isAdminView?: boolean;
}

interface Row {
  project_id: number;
  task_id: number;
  description: string;
  entries: Array<TimesheetEntry>;
}

export const TimesheetTable = ({
  startDate,
  entries,
  employeeId,
  isAdminView = false,
}: TimesheetTableProps) => {

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchProjects());
  }, [dispatch]);

  const [allRows, setAllRows] = useState<Row[]>([]);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const projects = useAppSelector(selectAllProjects) || [];
  const tasks = useAppSelector(selectAllTasks) || [];
  const team_members = useAppSelector(selectAllTeamMembers) || [];
  const session = useSession();

  if (!employeeId) {
    employeeId = team_members.find((member) => member.user_id === session.data?.user.id)?.id.toString();
  }

  // Calculate week days
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startDate, i).toISOString().split('T')[0]
  );

  // Group entries by project_id and task_id
  useEffect(() => {
    const groupedRows: Record<string, Row> = {};

    const employee_name = employeeId? team_members.find((member) => member.id === Number(employeeId))?.name : 'Employee';

    entries.forEach((entry) => {
      const key = `${entry.project_id}-${entry.task_id}`;
      if (!groupedRows[key]) {
        groupedRows[key] = {
          project_id: entry.project_id || 0,
          task_id: entry.task_id,
          description: entry.description || 'Development',
          entries: [],
        };
      }
      groupedRows[key].entries.push({
        ...entry,
        date: entry.date.split('T')[0],
      });
    });

    // Fill missing entries for each group
    const rows = Object.values(groupedRows).map((row) => {
      const filledEntries = weekDays.map((day) => {
        const existingEntry = row.entries.find((entry) => entry.date === day);
        return (
          existingEntry || {
            id: 0,
            team_member_id: Number(employeeId),
            date: day,
            hours: 0,
            description: 'Development',
            project_id: row.project_id,
            task_id: row.task_id,
            team_member_name: employee_name,
          }
        );
      });
      return { ...row, entries: filledEntries };
    });

    setAllRows(rows.filter((row) => row.entries.some((entry) => entry.team_member_id === Number(employeeId))));
  }, [entries]);

  // Update a specific row
  const updateRow = (index: number, changes: Partial<Row>) => {
    const updatedRows = [...allRows];
    const updatedRow = { ...updatedRows[index], ...changes };

    if (changes.project_id || changes.task_id || changes.description) {
      updatedRow.entries = updatedRow.entries.map((entry) => ({
        ...entry,
        project_id: changes.project_id ?? updatedRow.project_id,
        task_id: changes.task_id ?? updatedRow.task_id,
        description: changes.description ?? entry.description,
      }));
    }

    updatedRows[index] = updatedRow;
    setAllRows(updatedRows);
  };

  // Add a new row
  const addRow = () => {
    const newRow: Row = {
      project_id: 0,
      task_id: 0,
      description: 'Development',
      entries: weekDays.map((day) => ({
        id: 0,
        team_member_id: Number(employeeId),
        date: day,
        hours: 0,
        description: 'Development',
        project_id: 0,
        task_id: 0,
        team_member_name: entries[0]?.team_member_name || 'Employee',
      })),
    };
    setAllRows([...allRows, newRow]);
  };

  // Calculate total hours for the week
  const calculateWeekTotal = () => {
    return allRows.reduce((total, row) => {
      return (
        total +
        row.entries.reduce((rowTotal, entry) => rowTotal + Number(entry.hours), 0)
      );
    }, 0);
  };

  //send the data
  const sendData = async () => {
    const localEntries = allRows.flatMap((row) =>
      row.entries.filter((entry) => entry.hours > 0).map((entry) => ({
        id: entry.id, // Preserve the ID for existing entries
        team_member_id: entry.team_member_id,
        date: entry.date,
        hours: entry.hours,
        description: entry.description,
        project_id: row.project_id,
        task_id: row.task_id,
        project_name: projects.find((project) => Number(project.id) === Number(row.project_id))?.name || 'Unknown Project',
        task_title: tasks.find((task) => task.id === row.task_id)?.title || 'Unknown Task',
        team_member_name: entry.team_member_name || 'Employee',
      }))
    );
  
    if (!localEntries.length) {
      toast.error('No data to send.');
      return;
    }
  
    try {
      console.log('Sending timesheet data...', {
        entries: localEntries,
        employeeName: localEntries[0].team_member_name || 'Employee',
        startDate: weekDays[0],
        endDate: weekDays[weekDays.length - 1],
      });
  
      const response = await fetch('/api/sendData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: localEntries,
          employeeName: localEntries[0].team_member_name || 'Employee',
          startDate: weekDays[0],
          endDate: weekDays[weekDays.length - 1],
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send timesheet');
      }
  
      toast.success('Timesheet submitted successfully');
    } catch (error) {
      console.error('Failed to submit timesheet:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit timesheet'
      );
    }
  };

  // Save data
  const saveData = async () => {
    const newEntries: Array<Omit<TimesheetEntry, 'id'>> = [];
    const updatedEntries: Array<{ id: number; changes: Partial<TimesheetEntry> }> = [];
    const deletedEntries: number[] = [];

    allRows.forEach((row) => {
      row.entries.forEach((entry) => {
        if (entry.hours === 0 && entry.id) {
          deletedEntries.push(entry.id);
        } else if (entry.hours > 0) {
          if (entry.id === 0) {
            newEntries.push({
              team_member_id: entry.team_member_id,
              project_id: row.project_id,
              task_id: row.task_id,
              date: entry.date,
              hours: entry.hours,
              description: entry.description,
            });
          } else {
            updatedEntries.push({
              id: entry.id,
              changes: {
                hours: entry.hours,
                description: entry.description,
                project_id: row.project_id,
                task_id: row.task_id,
              },
            });
          }
        }
      });
    });

    try {
      if (newEntries.length > 0) {
        await Promise.all(
          newEntries.map((entry) =>
            fetch('/api/timesheet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry),
            })
          )
        );
      }

      if (updatedEntries.length > 0) {
        await Promise.all(
          updatedEntries.map(({ id, changes }) =>
            fetch(`/api/timesheet/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(changes),
            })
          )
        );
      }

      if (deletedEntries.length > 0) {
        await Promise.all(
          deletedEntries.map((id) =>
            fetch(`/api/timesheet/${id}`, { method: 'DELETE' })
          )
        );
      }

      toast.success('Changes saved successfully!');
    } catch (error) {
      console.error('Failed to save timesheet data:', error);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  // Handle submit timesheet
  const handleSubmitTimesheet = async () => {
    await sendData();
    setShowSubmitDialog(false);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Task</TableHead>
            {weekDays.map((day) => (
              <TableHead key={day}>{format(new Date(day), 'EEE dd')}</TableHead>
            ))}
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allRows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell>
                <Select
                  value={row.project_id.toString()}
                  onValueChange={(value) =>
                    updateRow(rowIndex, { project_id: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={row.task_id.toString()}
                  onValueChange={(value) =>
                    updateRow(rowIndex, { task_id: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              {row.entries.map((entry, entryIndex) => (
                <TableCell key={entryIndex}>
                  <Input
                    type="number"
                    value={entry.hours}
                    onChange={(e) => {
                      const hours = parseFloat(e.target.value) || 0;
                      updateRow(rowIndex, {
                        entries: row.entries.map((ent, idx) =>
                          idx === entryIndex ? { ...ent, hours } : ent
                        ),
                      });
                    }}
                  />
                </TableCell>
              ))}
              <TableCell>
                <Select
                  value={row.description}
                  onValueChange={(value) =>
                    updateRow(rowIndex, { description: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Description" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Development', 'Meetings', 'Planning', 'Research'].map(
                      (desc) => (
                        <SelectItem key={desc} value={desc}>
                          {desc}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between mt-4">
        <div className="flex gap-5 items-center">
          <div className="text-center font-medium">
            Total Hours: {calculateWeekTotal()}
          </div>
          {isAdminView && (
            <>
              <Button onClick={addRow} className="gap-2">
                <Plus className="h-4 w-4" /> Add Entry
              </Button>
              <Button onClick={saveData} className="gap-2 ml-2">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
              <Button onClick={() => setShowSubmitDialog(true)}>
                Submit Timesheet
              </Button>
            </>
          )}
        </div>
        <SubmitTimesheetDialog
          open={showSubmitDialog}
          onClose={() => setShowSubmitDialog(false)}
          onSubmit={handleSubmitTimesheet}
        />
      </div>
    </div>
  );
};
