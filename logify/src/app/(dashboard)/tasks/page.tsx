'use client';

import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { TaskList } from '@/components/tasks/task-list';
import { TaskFilters } from '@/components/tasks/task-filters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </div>

        <TaskFilters />
        <TaskList />
      </div>
    </DashboardWrapper>
  );
}