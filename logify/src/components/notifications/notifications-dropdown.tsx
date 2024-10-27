'use client';
/* eslint-disable  @typescript-eslint/prefer-as-const */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'task' | 'project';
  title: string;
  timestamp: Date;
  status: string;
  entityId: string;
}

export function NotificationsDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data generation for notifications
  useEffect(() => {
    const currentDate = new Date();
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'task' as 'task',
        title: 'Design user interface',
        timestamp: new Date(currentDate.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'completed',
        entityId: 'task-1',
      },
      {
        id: '2',
        type: 'project' as 'project',
        title: 'Mobile App Development',
        timestamp: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'completed',
        entityId: 'project-2',
      },
      {
        id: '3',
        type: 'task' as 'task',
        title: 'API Integration',
        timestamp: new Date(currentDate.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        status: 'completed',
        entityId: 'task-3',
      },
      // Add more notifications...
    ].filter(notification => {
      // Filter notifications from the current month
      return notification.timestamp.getMonth() === currentDate.getMonth() &&
             notification.timestamp.getFullYear() === currentDate.getFullYear();
    });

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.length);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'task') {
      router.push(`/tasks/${notification.entityId}`);
    } else {
      router.push(`/projects/${notification.entityId}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <DropdownMenuLabel className="font-semibold p-4">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-4 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {notification.type === 'task' ? '✓ Task Completed' : '🎉 Project Finished'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {notification.title}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No new notifications
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}