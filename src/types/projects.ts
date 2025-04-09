// src/types/projects.ts
export type ProjectStatus = 'בתכנון' | 'בתהליך' | 'מעוכב' | 'הושלם' | 'בוטל';
export type ProjectPriority = 'נמוכה' | 'בינונית' | 'גבוהה' | 'דחופה';

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: 'לביצוע' | 'בתהליך' | 'הושלם';
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  priority?: 'נמוכה' | 'בינונית' | 'גבוהה';
  weight: number; // אחוז מהפרויקט (1-100)
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completedAt?: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  dueDate?: string;
  completedAt?: string;
  category: string;
  tags: string[];
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  team: string[];
  owner: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  budget?: number;
  actualCost?: number;
  attachments?: string[];
  progress: number; // אחוז השלמה מחושב
  isArchived: boolean;
}

export interface ProjectFilter {
  status?: ProjectStatus[];
  category?: string[];
  priority?: ProjectPriority[];
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  searchTerm?: string;
  tags?: string[];
  includeArchived?: boolean;
  team?: string[];
}

export interface ProjectSortOption {
  field: 'title' | 'dueDate' | 'startDate' | 'priority' | 'status' | 'progress' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}