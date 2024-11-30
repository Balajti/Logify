'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Project } from '@/lib/redux/features/projects/types';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/redux/features/projects/projectsSlice';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string(),
  status: z.enum(['not-started', 'in-progress', 'on-hold', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

const defaultValues: Omit<Project, 'id'> = {
  name: '',
  description: '',
  status: 'not-started',
  priority: 'medium',
  startDate: '',
  endDate: '',
  dueDate: '',
  progress: 0,
  team: [],
  tasks: [],
  task_completed: 0,
  task_total: 0,
  admin_id: '',
};

export function CreateProjectDialog({
  open,
  onClose,
}: CreateProjectDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = async (data: Omit<Project, 'id'>) => {
    try {
      const formattedStartDate = format(new Date(data.startDate), 'yyyy-MM-dd');
      const formattedEndDate = format(new Date(data.endDate), 'yyyy-MM-dd');
      const formattedDueDate = format(new Date(data.endDate), 'MMM dd');
      await dispatch(createProject({
        ...data,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        dueDate: formattedDueDate,
        progress: 0,
        team: [],
        task_completed: 0,
        task_total: 0,
        tasks: [],
        name: data.name.trim(),
        description: data.description.trim(),
        status: data.status || 'not-started',
        priority: data.priority || 'medium',
      }));
      router.push('/projects');
      setError(null);
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to create project';
      console.error(errorMessage);
      setError(errorMessage);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}