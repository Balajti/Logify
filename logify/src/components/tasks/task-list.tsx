'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { MoreVertical, Clock } from 'lucide-react';
import { EditTaskDialog } from './edit-task-dialog';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate: string;
  project: string;
  isCompleted: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Design user interface',
      description: 'Create wireframes and mockups for the new dashboard',
      status: 'in-progress',
      priority: 'high',
      assignee: {
        id: '1',
        name: 'John Doe',
      },
      dueDate: '2024-11-01',
      project: 'Website Redesign',
      isCompleted: false,
    },
    {
      id: '2',
      title: 'Make the website responsive',
      description: 'Make the website responsive for mobile and tablet devices',
      status: 'completed',
      priority: 'medium',
      assignee: {
        id: '2',
        name: 'Jane Smith',
      },
      dueDate: '2024-12-01',
      project: 'Website Redesign',
      isCompleted: true,
    },
    {
      id: '3',
      title: 'Create wireframes and mockups',
      description: 'Create wireframes and mockups for the new dashboard',
      status: 'todo',
      priority: 'high',
      assignee: {
        id: '1',
        name: 'John Doe',
      },
      dueDate: '2024-11-01',
      project: 'Mobile App Development',
      isCompleted: false,
    },
  ]);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, isCompleted: completed } : task
    ));
  };

  const handleTaskEdit = (task: Task) => {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
    setEditingTask(null);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority];
  };

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex items-center space-x-4">
              <Checkbox 
                checked={task.isCompleted}
                onCheckedChange={(checked) => 
                  handleTaskComplete(task.id, checked as boolean)
                }
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium leading-none">{task.title}</h4>
                    <p className="text-sm text-gray-500">{task.project}</p>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{task.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Due {task.dueDate}</span>
                  </div>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingTask(task)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      <EditTaskDialog
        task={editingTask}
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleTaskEdit}
      />
    </>
  );
}