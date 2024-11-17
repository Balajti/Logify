// logify/src/app/(dashboard)/team/page.tsx
'use client';

import { useEffect } from 'react';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { Button } from '@/components/ui/button';
import { TeamList } from '@/components/projects/team-list';
import { TeamFilters } from '@/components/team/team-filters';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchTeamMembers, selectAllTeamMembers, selectTeamStatus } from '@/lib/redux/features/team/teamSlice';
import { Plus } from 'lucide-react';

export default function TeamPage() {
  const dispatch = useAppDispatch();
  const teamMembers = useAppSelector(selectAllTeamMembers);
  const status = useAppSelector(selectTeamStatus);

  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Failed to load team members</div>;
  }


  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Team</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
        <TeamFilters />
        <TeamList teamMembers={teamMembers} />
      </div>
    </DashboardWrapper>
  );
}