export interface TeamMemberWorkload {
    assigned: number;
    completed: number;
  }
  
  export interface TeamMemberPerformance {
    tasksCompleted: number;
    onTime: number;
    overdue: number;
  }
  
  export interface TeamMember {
    id: number;
    admin_id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    avatar?: string;
    status: 'active' | 'away' | 'offline';
    user_id: string;
    projects: number[];
    tasks: number[];
    workload: TeamMemberWorkload;
    performance: TeamMemberPerformance;
    availability: number;
  }
  
  export interface TeamStats {
    totalMembers: number;
    activeMembers: number;
    departmentDistribution: Record<string, number>;
    averageWorkload: number;
    topPerformers: number[];
  }
  
  export interface TeamState {
    members: TeamMember[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    filters: {
      department: string[];
      status: string[];
      search: string;
      availability: number | null;
      project: number | null;
    };
    stats: TeamStats;
    selectedMember: number | null;
  }
  
  export type CreateTeamMemberDTO = Omit<TeamMember, 'id' | 'admin_id'>;
  export type UpdateTeamMemberDTO = Partial<CreateTeamMemberDTO>;