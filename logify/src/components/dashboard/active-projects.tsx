import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Project } from '@/lib/redux/features/projects/projectsSlice';

interface ActiveProjectsProps {
  projects: Array<Pick<Project, 'id' | 'name' | 'progress' | 'status'> & { dueDate: string }>;
}

export function ActiveProjects({ projects }: ActiveProjectsProps) {
  const getStatusColor = (status: Project['status']) => {
    const colors = {
      'not-started': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-gray-100 text-gray-800',
      'completed': 'bg-green-100 text-green-800',
    };
    return colors[status] || colors['in-progress'];
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Active Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {project.dueDate}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>
              <Progress value={project.progress} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}