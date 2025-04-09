export interface Project {
  id?: string;
  name: string;
  description: string;
  status: 'לא התחיל' | 'בתהליך' | 'הושלם' | 'מושהה' | string;
  progress: number;
  createdAt: string;
  dueDate?: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface ProjectFormValues {
  name: string;
  description: string;
  status: string;
  progress: number;
  dueDate?: string;
}

export interface MilestoneFormValues {
  title: string;
  description?: string;
  dueDate?: string;
}