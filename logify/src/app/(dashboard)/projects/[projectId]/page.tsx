// @ts-nocheck
'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, CalendarDays, Users, CheckSquare, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tasks } from '@/lib/types/task';
import {
  selectAllProjects,
  selectProjectById,
  deleteProjectAsync,
} from '@/lib/redux/features/projects/projectsSlice';

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  // Use typed dispatch
  const dispatch = useAppDispatch();

  const projects = useAppSelector(selectAllProjects);
  const project = useAppSelector(state => selectProjectById(state, Number(projectId)));
  const tasks = useAppSelector(state => state.tasks.items);
  const teamMembers = useAppSelector(state => state.team.members);

  const filteredTasks = tasks.filter(task => Number(task.projectId) !== Number(projectId));
  const filteredTeamMembers = teamMembers.filter(member => member.projects.includes(Number(projectId)));
  const router = useRouter();
  const tasksFromProject = project?.tasks || []; 

  if (!project) {
    return <div>Project not found</div>;
  }

  const getPriorityColor = (priority: Tasks['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority];
  };


  const handleDeleteProject = (projId: number) => {
    dispatch(deleteProjectAsync(projId));
    
    router.push('/projects');
  };


  let totalHours = 0;
  project.timesheets?.forEach((timesheet) => {
    totalHours += timesheet.hours;
  });

  const date = project.due_date ? new Date(project.due_date) : null;
  const month = date ? (date.getMonth() + 1).toString().padStart(2, '0') : '';
  const day = date ? date.getDate().toString().padStart(2, '0') : '';

  const dueDate = date ? `${date.getFullYear()}-${month}-${day}` : '';


  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Project Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-500 mt-2">{project.description}</p>
          </div>
          {/* Pass a function to onClick, not immediately invoke */}
          <Button
            variant="destructive"
            className="flex items-center space-x-2"
            onClick={() => handleDeleteProject(Number(projectId))}
          >
            <Trash2 className="h-5 w-5" />
            <span>Remove</span>
          </Button>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Clock className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold">{totalHours}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <CheckSquare className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-gray-500">Tasks</p>
              <p className="text-2xl font-bold">
                {project.task_completed}/{project.task_total || '0'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <CalendarDays className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="text-2xl font-bold">{dueDate}</p>
            </CardContent>
          </Card>
        </div>

        {/* Project Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Completion</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p>{project.startDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p>{project.endDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="capitalize">{project.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <p className="capitalize">{project.priority}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Tasks</h3>
                </div>
                <div className="space-y-4">
                  {tasksFromProject.map((task) => (
                    <div
                      key={task.task_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4 w-full justify-between">
                        <div>
                        
                          <p className="font-medium">{task.task_title}</p>
                          
                          <p className="text-sm text-gray-500">{task.task_description}</p>
                        </div>
                        <div className="flex items-center space-x-4 flex-row">
                          <p className="font-medium">Priority: </p>
                          
                          <Badge className={getPriorityColor(task.task_priority)}>
                            {task.task_priority}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 flex-row">
                          <p className="font-medium">Status: </p>
                          <p className="text-sm text-gray-500">{task.task_status}</p>
                        </div>
                        <div className="flex items-center space-x-4 flex-row">
                          <p className="font-medium">Due date: </p>
                          <p className="text-sm text-gray-500">{task.task_due_date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardWrapper>
  );
}
