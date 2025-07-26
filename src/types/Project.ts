export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  role: 'owner' | 'member' | 'observer';
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  tasksCount: number;
  completedTasks: number;
  membersCount: number;
  color: string;
  hasNotifications: boolean;
  progress: number;
  owner: {
    name: string;
    avatar?: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export type ProjectStatus = 'all' | 'active' | 'completed' | 'paused' | 'archived';
export type SortOption = 'name' | 'created' | 'updated' | 'activity';
export type ViewMode = 'grid' | 'list';