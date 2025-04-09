/**
 * Project status types
 */
export type ProjectStatus = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'ON_HOLD' 
  | 'COMPLETED' 
  | 'CANCELLED';

/**
 * Project priority levels
 */
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/**
 * Project milestone interface
 */
export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completedAt: string | null;
  isCompleted: boolean;
}

/**
 * Project interface
 */
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
  progress: number; // 0 to 100
  tags: string[];
  milestones: Milestone[];
}

/**
 * Project filter options
 */
export interface ProjectFilter {
  status?: ProjectStatus | 'ALL';
  priority?: ProjectPriority | 'ALL';
  searchTerm?: string;
  tags?: string[];
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
  };
}

/**
 * Sort options for projects
 */
export type ProjectSortOption = 
  | 'TITLE' 
  | 'CREATED_DATE' 
  | 'DUE_DATE' 
  | 'PRIORITY' 
  | 'PROGRESS';

/**
 * Sort direction
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Project sort configuration
 */
export interface ProjectSortConfig {
  option: ProjectSortOption;
  direction: SortDirection;
}