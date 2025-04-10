
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
  dueDate: string;  // Making this required based on error message
  createdAt: string;
  completedAt?: string;  // Adding this field based on the code usage
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
