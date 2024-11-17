'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { Project } from '@/lib/redux/features/projects/projectsSlice';

const ProjectFormValues: Omit<Project, 'id'> = {
  name: '',
  description: '',
  status: 'not-started',
  priority: 'medium',
  startDate: '',
  endDate: '',
  dueDate: '',
  progress: 0,
  team: [],
  task: { total: 0, completed: 0 },
  tasks: [],
};

export default function Page() {
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: ProjectFormValues,
  });

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <CreateProjectDialog open={true} onClose={() => {}}/>
      {error && (
        <div className="text-red-600 mt-4">{error}</div>
      )}
    </div>
  );
}