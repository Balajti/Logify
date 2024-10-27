'use client';

import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent 
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Mail, Phone, MoreVertical } from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'away' | 'offline';
  projects: number;
}

export function TeamGrid() {
  const { members, filters } = useAppSelector((state) => state.team);
  
  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.role.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.email.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesDepartment = filters.department.length === 0 || 
      filters.department.includes(member.department.toLowerCase());
    
    const matchesStatus = filters.status.length === 0 || 
      filters.status.includes(member.status);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: TeamMember['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      away: 'bg-yellow-100 text-yellow-800',
      offline: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredMembers.map((member) => (
        <Card key={member.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(member.status)}>
                {member.status}
              </Badge>
              <span className="text-sm text-gray-500">{member.projects} Projects</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2" />
                {member.email}
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2" />
                {member.phone}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}