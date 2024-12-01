import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  user_id?: string;
}

interface TeamListProps {
  teamMembers: TeamMember[];
}

export function TeamList({ teamMembers }: TeamListProps) {
  const session = useSession();

  return (
    <div className="space-y-4">
      {teamMembers.map((member) => (
        <div key={member.id} className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={member.avatar} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="text-sm font-medium">{ member.user_id === session.data?.user.id ? 'Me' : member.name }</h4>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}