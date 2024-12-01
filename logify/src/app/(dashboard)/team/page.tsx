'use client';

import { useEffect } from 'react';
import { DashboardWrapper } from '@/components/shared/layouts/dashboard-wrapper';
import { TeamList } from '@/components/projects/team-list';
import { TeamFilters } from '@/components/team/team-filters';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchTeamMembers, selectAllTeamMembers, selectTeamStatus } from '@/lib/redux/features/team/teamSlice';
import { useAuthorization } from '@/hooks/use-authorization';
import { AddMemberDialog } from '@/components/team/add-member-dialog';

export default function TeamPage() {
  const dispatch = useAppDispatch();
  const teamMembers = useAppSelector(selectAllTeamMembers);
  const status = useAppSelector(selectTeamStatus);
  const { isAdmin } = useAuthorization();

  const handleMemberAdded = () => {
    dispatch(fetchTeamMembers());
  };

  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Team</h1>
          {isAdmin && <AddMemberDialog onMemberAdded={handleMemberAdded} />}
        </div>
        <TeamFilters />
        <TeamList teamMembers={teamMembers} />
      </div>
    </DashboardWrapper>
  );
}