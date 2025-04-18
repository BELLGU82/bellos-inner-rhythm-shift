
export interface Project {
  id?: string;
  name: string;
  description: string;
  status: 'לא התחיל' | 'בתהליך' | 'הושלם' | 'מושהה' | string;
  progress: number;
  createdAt: string;
  dueDate?: string;
  milestones: Milestone[];
  title?: string; // For compatibility with existing code
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  dueDate: string;  
  createdAt?: string;
  completedAt?: string;
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

// Helper function to convert between Project and ProjectMilestone types
export const convertToProjectMilestone = (milestone: Milestone): import('./projects').ProjectMilestone => {
  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    dueDate: milestone.dueDate,
    completedAt: milestone.completedAt
  };
};

// Helper function to convert between ProjectMilestone and Milestone types
export const convertToMilestone = (projectMilestone: import('./projects').ProjectMilestone): Milestone => {
  return {
    id: projectMilestone.id,
    title: projectMilestone.title,
    description: projectMilestone.description,
    dueDate: projectMilestone.dueDate,
    completedAt: projectMilestone.completedAt,
    completed: !!projectMilestone.completedAt
  };
};
