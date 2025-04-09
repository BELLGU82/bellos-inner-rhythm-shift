export type ProjectStatus = 'לא התחיל' | 'בתהליך' | 'הושלם';

export interface Milestone {
  name: string;
  completed: boolean;
  dueDate?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
  createdAt: string;
  milestones: Milestone[];
}