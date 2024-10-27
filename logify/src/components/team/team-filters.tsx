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
import { setTeamFilters } from "@/lib/redux/features/team/teamSlice";

export function TeamFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.team.filters);

  const handleDepartmentChange = (value: string) => {
    const currentDepartments = filters.department.includes(value)
      ? filters.department.filter((d) => d !== value)
      : [...filters.department, value];
    dispatch(setTeamFilters({ department: currentDepartments }));
  };

  const handleStatusChange = (value: string) => {
    const currentStatuses = filters.status.includes(value)
      ? filters.status.filter((s) => s !== value)
      : [...filters.status, value];
    dispatch(setTeamFilters({ status: currentStatuses }));
  };

  const handleSearchChange = (value: string) => {
    dispatch(setTeamFilters({ search: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search members..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
        
        <Select onValueChange={handleDepartmentChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="away">Away</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        {filters.department.map((department) => (
          <Badge
            key={department}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handleDepartmentChange(department)}
          >
            {department} ×
          </Badge>
        ))}
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
      </div>
    </div>
  );
}