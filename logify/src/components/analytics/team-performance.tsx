'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function TeamPerformance() {
  const teamMembers = [
    { name: 'John Doe', completed: 85, total: 100 },
    { name: 'Jane Smith', completed: 72, total: 80 },
    { name: 'Mike Johnson', completed: 45, total: 50 },
    { name: 'Sarah Williams', completed: 32, total: 40 },
  ];

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