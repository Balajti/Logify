'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock } from 'lucide-react';

interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  description: string;
}

interface TimeTrackingListProps {
  projectId: string;
}

export function TimeTrackingList({ projectId }: TimeTrackingListProps) {
  // This would come from Redux in a real app
  console.log(projectId);
  const timeEntries: TimeEntry[] = [
    {
      id: '1',
      taskId: '1',
      userId: '1',
      startTime: '2024-10-26T09:00:00',
      endTime: '2024-10-26T12:30:00',
      duration: 3.5,
      description: 'Working on UI design',
    },
    // Add more mock entries...
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">Current Timer</h3>
              <p className="text-sm text-gray-500">No timer running</p>
            </div>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {timeEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-white"
          >
            <div>
              <p className="font-medium">{entry.description}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{entry.duration} hours</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(entry.startTime).toLocaleTimeString()} -{' '}
              {entry.endTime
                ? new Date(entry.endTime).toLocaleTimeString()
                : 'Ongoing'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}