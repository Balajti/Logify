'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectFilters } from '@/components/projects/project-filters';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  const { items: projects, status, filters } = useAppSelector((state) => state.projects);

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
          <Link href="/projects/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </Link>
        </div>

        <ProjectFilters />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </DashboardWrapper>
  );
}