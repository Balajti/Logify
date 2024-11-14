'use client';

import { useState } from 'react';
import { useAuthorization } from '@/hooks/use-authorization';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectFilters } from '@/components/projects/project-filters';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { Plus } from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';

export default function ProjectsPage() {
  const { isAdmin } = useAuthorization();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { items: projects, filters } = useAppSelector((state) => state.projects);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         project.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status.length === 0 || filters.status.includes(project.status);
    const matchesPriority = filters.priority.length === 0 || filters.priority.includes(project.priority);
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Projects</h1>
          {isAdmin && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          )}
        </div>

        <ProjectFilters />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard 
              key={project.id}
              project={project}
              isAdmin={isAdmin}
              />
            ))}
        </div>

        {isAdmin && (
          <CreateProjectDialog
            open={showCreateDialog}
            onClose={() => setShowCreateDialog(false)}
          />
        )}
      </div>
    </DashboardWrapper>
  );
}