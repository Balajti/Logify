// src/components/projects/project-filters.tsx
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
import { setFilters } from "@/lib/redux/features/projects/projectsSlice";

export function ProjectFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.projects.filters);

  const handleStatusChange = (value: string) => {
    const currentStatuses = filters.status.includes(value)
      ? filters.status.filter((s) => s !== value)
      : [...filters.status, value];
    dispatch(setFilters({ status: currentStatuses }));
  };

  const handlePriorityChange = (value: string) => {
    const currentPriorities = filters.priority.includes(value)
      ? filters.priority.filter((p) => p !== value)
      : [...filters.priority, value];
    dispatch(setFilters({ priority: currentPriorities }));
  };

  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search projects..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
        
        <Select onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
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
      </div>

      <div className="flex gap-2">
        {filters.status.map((status) => (
          <Badge
            key={status}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handleStatusChange(status)}
          >
            {status} ×
          </Badge>
        ))}
        {filters.priority.map((priority) => (
          <Badge
            key={priority}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handlePriorityChange(priority)}
          >
            {priority} ×
          </Badge>
        ))}
      </div>
    </div>
  );
}