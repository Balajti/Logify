// @ts-nocheck
'use client';

import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { deleteTaskAsync , toggleTaskComplete, updateTaskAsync } from '@/lib/redux/features/tasks/tasksSlice';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { MoreVertical, Clock } from 'lucide-react';
import { EditTaskDialog } from './edit-task-dialog';
import { useState, useEffect } from 'react';
import { Tasks } from '@/lib/types/task';
import { selectAllTeamMembers, fetchTeamMembers } from '@/lib/redux/features/team/teamSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export function TaskList() {

  const handleTaskDelete = (taskId: number) => {
    dispatch(deleteTaskAsync(taskId));
  };

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);
  const users = useAppSelector(selectAllTeamMembers);

  const { items: tasks, filters } = useAppSelector((state) => state.tasks);
  const [editingTask, setEditingTask] = useState<Tasks | null>(null);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = (
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filters.search.toLowerCase())
    );
    
    const matchesStatus = filters.status.length === 0 || filters.status.includes(task.status);
    const matchesPriority = filters.priority.length === 0 || filters.priority.includes(task.priority);
    const matchesProject = filters.project.length === 0 || filters.project.includes(task.projectId);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const handleTaskComplete = (taskId: number, completed: boolean) => {
    dispatch(toggleTaskComplete(taskId));
  };

  const handleTaskEdit = (task: Tasks) => {
    dispatch(updateTaskAsync({ id: task.id, data: task }));
    setEditingTask(null);
  };

  const getPriorityColor = (priority: Tasks['priority']) => {
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
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium leading-none">{task.title}</h4>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500">{task.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Due: {task.due_date.split('T')[0]}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                    <Avatar>
                    <AvatarImage 
                      src={users.find((user) => user.tasks.some(t => t.task_id === task.id))?.avatar || ''}
                    />
                    <AvatarFallback>
                    {users.find((user) => user.tasks.some(t => t.task_id === task.id))?.name.charAt(0) || ''}
                    </AvatarFallback>
                    </Avatar>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{users.find((user) => user.tasks.some(t => t.task_id === task.id))?.name}</h4>
                  </div>
                </div>
                <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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