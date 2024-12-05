export interface TeamMemberFormData {
    name: string;
    role?: string;
    department?: string;
    email: string;
    phone?: string;
    avatar?: string;
    status: 'active' | 'away' | 'offline';
  }