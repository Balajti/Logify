'use client';

import { useParams } from 'next/navigation';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { useAppSelector } from '@/lib/redux/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, CalendarDays, Users, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tasks } from '@/lib/types/task';
import { mockTasks, mockTeamMembers } from '@/lib/data/mockData';

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const project = useAppSelector(state =>
    state.projects.items.find(p => p.id === Number(projectId))
  );

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

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Project Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-500 mt-2">{project.description}</p>
          </div>
          <Button>Edit Project</Button>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Clock className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold">142.5</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <CheckSquare className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-gray-500">Tasks</p>
              <p className="text-2xl font-bold">{project.task.completed}/{project.task.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Users className="h-8 w-8 text-purple-500 mb-2" />
              <p className="text-sm text-gray-500">Team Members</p>
              <p className="text-2xl font-bold">{project.team.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <CalendarDays className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="text-2xl font-bold">{project.dueDate}</p>
            </CardContent>
          </Card>
        </div>

        {/* Project Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
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
                  <Button>Add Task</Button>
                </div>
                <div className="space-y-4">
                  {project.tasks.map((taskId) => (
                    <div key={mockTasks[taskId - 1].id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4 w-full justify-between">
                        <div>
                          <p className="font-medium">{mockTasks[taskId - 1].title}</p>
                          <p className="text-sm text-gray-500">{mockTasks[taskId - 1].description}</p>
                        </div>
                        <div className='flex items-center space-x-4 flex-row'>
                          <p className='font-medium'>Priority: </p>
                          <Badge className={getPriorityColor(mockTasks[taskId - 1].priority)}>
                            {mockTasks[taskId - 1].priority}
                          </Badge>
                        </div>
                        <div className='flex items-center space-x-4 flex-row'>
                          <p className='font-medium'>Status: </p>
                          <p className="text-sm text-gray-500">{mockTasks[taskId - 1].status}</p>
                        </div>
                        <div className='flex items-center space-x-4 flex-row'>
                          <p className='font-medium'>Due date: </p>
                          <p className="text-sm text-gray-500">{mockTasks[taskId - 1].dueDate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <Button>Add Member</Button>
                </div>
                <div className="space-y-4">
                  {project.team.map((memberId) => (
                    <div key={mockTeamMembers[memberId-1].id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={mockTeamMembers[memberId-1].avatar} />
                          <AvatarFallback>{mockTeamMembers[memberId-1].name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{mockTeamMembers[memberId-1].name}</p>
                          <p className="text-sm text-gray-500">{mockTeamMembers[memberId-1].role}</p>
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