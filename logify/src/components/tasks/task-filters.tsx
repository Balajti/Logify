'use client';

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TaskFilters() {
  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search tasks..."
        className="max-w-sm"
      />
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low Priority</SelectItem>
          <SelectItem value="medium">Medium Priority</SelectItem>
          <SelectItem value="high">High Priority</SelectItem>
        </SelectContent>
      </Select>
      <Select>
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
  );
}