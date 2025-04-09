export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  completedAt: string | null;
  progress: number;
  tags: string[];
  milestones: Milestone[];
}

export interface ProjectFilters {
  searchTerm?: string;
  status?: ProjectStatus | 'ALL';
  priority?: ProjectPriority | 'ALL';
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export interface ProjectSortOptions {
  field: keyof Project;
  direction: 'asc' | 'desc';
}