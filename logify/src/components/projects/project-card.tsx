import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/redux/features/projects/types";
import { useRouter } from "next/navigation";
import { useAppSelector } from '@/lib/redux/hooks';
import { selectAllTeamMembers } from '@/lib/redux/features/team/teamSlice';

interface ProjectCardProps {
  project: Project;
  isAdmin?: boolean;
}

export function ProjectCard({ project, isAdmin = false }: ProjectCardProps) {
  const teamMembers = useAppSelector(selectAllTeamMembers);


  const getStatusColor = (status: Project['status']) => {
    const colors = {
      'not-started': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors];
  };

  const getPriorityColor = (priority: Project['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority];
  };

  const router = useRouter();
  const handleProjectClick = (projectId: number) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <Card onClick={() => handleProjectClick(project.id)} className="cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          {isAdmin && (
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{project.description}</p>
            <div className="flex items-center justify-between gap-1">
              <span className="w-1/4">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
              </span>
              </span>
              <Progress value={project.progress} className="w-3/4" />
            </div>
          <div className="text-sm text-gray-500">Team</div>
          <div className="flex -space-x-2">
            {project.team?.map((memberId) => {
              const member = teamMembers.find(m => m.id === memberId);
              return member ? (
                <Avatar key={member.id} className="border-2 border-white">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : null;
            })}
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Tasks: {project.task_completed ?? 0}/{project.task_total ?? 0}</span>
            <span>Due: {project.dueDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}