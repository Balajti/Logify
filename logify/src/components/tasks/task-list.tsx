'use client';

import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { deleteTask, toggleTaskComplete, updateTask, type Task } from '@/lib/redux/features/tasks/tasksSlice';
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
import { useState } from 'react';

export function TaskList() {

  const handleTaskDelete = (taskId: string) => {
    dispatch(deleteTask(taskId));
  };

  const dispatch = useAppDispatch();
  const { items: tasks, filters } = useAppSelector((state) => state.tasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = (
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filters.search.toLowerCase())
    );
    
    const matchesStatus = filters.status.length === 0 || filters.status.includes(task.status);
    const matchesPriority = filters.priority.length === 0 || filters.priority.includes(task.priority);
    const matchesProject = filters.project.length === 0 || filters.project.includes(task.project);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    dispatch(toggleTaskComplete(taskId));
  };

  const handleTaskEdit = (task: Task) => {
    dispatch(updateTask(task));
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
        {filteredTasks.map((task) => (
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
                  <DropdownMenuItem 
                    onClick={() => handleTaskDelete(task.id)}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleTaskEdit}
        />
      )}
    </>
  );
}