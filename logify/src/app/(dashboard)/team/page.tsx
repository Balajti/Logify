'use client';

import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { TeamGrid } from '@/components/team/team-grid';
import { TeamFilters } from '@/components/team/team-filters';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function TeamPage() {
  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Team</h1>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </div>
        <TeamFilters />
        <TeamGrid />
      </div>
    </DashboardWrapper>
  );
}