import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/redux/features/projects/projectsSlice";

interface ProjectCardProps {
  project: Project;
  isAdmin?: boolean;
}

export function ProjectCard({ project, isAdmin = false }: ProjectCardProps) {
  const getStatusColor = (status: Project['status']) => {
    const colors = {
      'not-started': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Project['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority];
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{project.name}</h3>
          <div className="flex gap-2">
            <Badge variant="secondary" className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <Badge variant="secondary" className={getPriorityColor(project.priority)}>
              {project.priority}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-500">{project.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} />
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-gray-500">Team</div>
          <div className="flex -space-x-2">
            {project.team.map((member) => (
              <Avatar key={member.id} className="border-2 border-white">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span>Tasks: {project.tasks.completed}/{project.tasks.total}</span>
          <span>Due: {project.dueDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}