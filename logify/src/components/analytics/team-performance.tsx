'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchTasks, fetchTeamMembers, selectAllTasks, selectAllTeamMembers } from "@/lib/redux/features";
import { fetchDashboardData, selectDashboardStats } from "@/lib/redux/features/projects/projectsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { use, useEffect } from "react";

export function TeamPerformance() {

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);

  const team = useAppSelector(selectAllTeamMembers);


  const teamMembers: { name: string; completed: number; total: number }[] = [];

  team.forEach((member) => {
    let completed = 0;

    member.tasks.forEach((task) => {
      // @ts-ignore
      if (task && task.task_status === 'completed') {
        completed += 1;
      }
    });
  teamMembers.push({ name: member.name, completed, total: member.tasks.length });
  });
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{member.name}</span>
                <span>{Math.round((member.completed / member.total) * 100)}%</span>
              </div>
              <Progress 
                value={(member.completed / member.total) * 100} 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}