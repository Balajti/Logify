'use client';

import { useEffect, useState } from 'react';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { Button } from '@/components/ui/button';
import { TaskList } from '@/components/tasks/task-list';
import { TaskFilters } from '@/components/tasks/task-filters';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchTasks, selectAllTasks, selectTasksStatus } from '@/lib/redux/features/tasks/tasksSlice';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectAllTasks);
  const status = useAppSelector(selectTasksStatus);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </div>

        <TaskFilters />
        <TaskList />

        <EditTaskDialog
          task={null}
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSave={() => setShowCreateDialog(false)}
        />
      </div>
    </DashboardWrapper>
  );
}