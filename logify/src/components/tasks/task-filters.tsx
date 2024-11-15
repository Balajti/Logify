'use client';

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setTaskFilters } from "@/lib/redux/features/tasks/tasksSlice";
import type { RootState } from "@/lib/redux/store";
import { mockProjects } from "@/lib/data/mockData";

export function TaskFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state: RootState) => state.tasks.filters);

  const handleStatusChange = (value: string) => {
    const currentStatuses = filters.status.includes(value)
      ? filters.status.filter((s: string) => s !== value)
      : [...filters.status, value];
    dispatch(setTaskFilters({ status: currentStatuses }));
  };

  const handlePriorityChange = (value: string) => {
    const currentPriorities = filters.priority.includes(value)
      ? filters.priority.filter((p: string) => p !== value)
      : [...filters.priority, value];
    dispatch(setTaskFilters({ priority: currentPriorities }));
  };

  const handleProjectChange = (value: string) => {
    const tempProj = filters.project.map((ids) => mockProjects.find((p) => p.id === ids));
    const currentProjects = tempProj.some((project) => project && project.id === Number(value))
      ? filters.project.filter((p: number) => p !== Number(value))
      : [...filters.project, Number(value)];
    dispatch(setTaskFilters({ project: currentProjects }));
  };

  const handleSearchChange = (value: string) => {
    dispatch(setTaskFilters({ search: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
        
        <Select onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={handleProjectChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="website-redesign">Website Redesign</SelectItem>
            <SelectItem value="mobile-app">Mobile App</SelectItem>
            <SelectItem value="api-integration">API Integration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        {filters.status.map((status: string) => (
          <Badge
            key={status}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handleStatusChange(status)}
          >
            {status} ×
          </Badge>
        ))}
        {filters.priority.map((priority: string) => (
          <Badge
            key={priority}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handlePriorityChange(priority)}
          >
            {priority} ×
          </Badge>
        ))}
        {filters.project.map((project: number) => (
          <Badge
            key={project}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handleProjectChange(project.toString())}
          >
            {project} ×
          </Badge>
        ))}
      </div>
    </div>
  );
}