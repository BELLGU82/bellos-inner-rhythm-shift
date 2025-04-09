import { v4 as uuidv4 } from 'uuid';
import { Project, ProjectFilter, ProjectSortConfig } from '../types/Project';

// Local storage key
const PROJECTS_STORAGE_KEY = 'projects';

// Default projects for new users
const DEFAULT_PROJECTS: Project[] = [
  {
    id: uuidv4(),
    title: 'תכנון שבועי',
    description: 'ארגון המשימות השבועיות וקביעת יעדים לשבוע הקרוב',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    completedAt: null,
    progress: 30,
    tags: ['תכנון', 'שבועי', 'יעדים'],
    milestones: [
      {
        id: uuidv4(),
        title: 'הגדרת יעדים',
        description: 'הגדרת יעדים עיקריים לשבוע',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        completedAt: new Date().toISOString(),
        isCompleted: true
      },
      {
        id: uuidv4(),
        title: 'תעדוף משימות',
        description: 'תעדוף משימות לפי דחיפות וחשיבות',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        completedAt: null,
        isCompleted: false
      }
    ]
  }
];

/**
 * Service for managing projects
 */
class ProjectService {
  
  /**
   * Get all projects
   */
  getAll = (): Project[] => {
    const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    
    if (!storedProjects) {
      this.saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    
    return JSON.parse(storedProjects);
  };
  
  /**
   * Get project by ID
   */
  getById = (id: string): Project | null => {
    const projects = this.getAll();
    return projects.find(project => project.id === id) || null;
  };
  
  /**
   * Create a new project
   */
  create = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    const projects = this.getAll();
    projects.push(newProject);
    this.saveProjects(projects);
    
    return newProject;
  };
  
  /**
   * Update an existing project
   */
  update = (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null => {
    const projects = this.getAll();
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) {
      return null;
    }
    
    const updatedProject: Project = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    projects[projectIndex] = updatedProject;
    this.saveProjects(projects);
    
    return updatedProject;
  };
  
  /**
   * Delete a project
   */
  delete = (id: string): boolean => {
    const projects = this.getAll();
    const filteredProjects = projects.filter(project => project.id !== id);
    
    if (filteredProjects.length === projects.length) {
      return false;
    }
    
    this.saveProjects(filteredProjects);
    return true;
  };
  
  /**
   * Update project progress
   */
  updateProgress = (id: string, progress: number): Project | null => {
    return this.update(id, { progress });
  };
  
  /**
   * Complete a project
   */
  completeProject = (id: string): Project | null => {
    const now = new Date().toISOString();
    return this.update(id, { 
      status: 'COMPLETED', 
      completedAt: now,
      progress: 100
    });
  };
  
  /**
   * Add milestone to project
   */
  addMilestone = (projectId: string, milestone: Omit<Project['milestones'][0], 'id' | 'isCompleted' | 'completedAt'>): Project | null => {
    const project = this.getById(projectId);
    
    if (!project) {
      return null;
    }
    
    const newMilestone = {
      ...milestone,
      id: uuidv4(),
      isCompleted: false,
      completedAt: null
    };
    
    const updatedMilestones = [...project.milestones, newMilestone];
    return this.update(projectId, { milestones: updatedMilestones });
  };
  
  /**
   * Complete milestone
   */
  completeMilestone = (projectId: string, milestoneId: string): Project | null => {
    const project = this.getById(projectId);
    
    if (!project) {
      return null;
    }
    
    const updatedMilestones = project.milestones.map(milestone => 
      milestone.id === milestoneId 
        ? { ...milestone, isCompleted: true, completedAt: new Date().toISOString() } 
        : milestone
    );
    
    return this.update(projectId, { milestones: updatedMilestones });
  };
  
  /**
   * Filter projects
   */
  filterProjects = (projects: Project[], filter: ProjectFilter): Project[] => {
    return projects.filter(project => {
      // Filter by status
      if (filter.status && filter.status !== 'ALL' && project.status !== filter.status) {
        return false;
      }
      
      // Filter by priority
      if (filter.priority && filter.priority !== 'ALL' && project.priority !== filter.priority) {
        return false;
      }
      
      // Filter by search term
      if (filter.searchTerm) {
        const searchTermLower = filter.searchTerm.toLowerCase();
        const titleMatch = project.title.toLowerCase().includes(searchTermLower);
        const descMatch = project.description.toLowerCase().includes(searchTermLower);
        if (!titleMatch && !descMatch) {
          return false;
        }
      }
      
      // Filter by tags
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => 
          project.tags.includes(tag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      // Filter by date range
      if (filter.dateRange) {
        const { startDate, endDate } = filter.dateRange;
        const projectDate = new Date(project.dueDate);
        
        if (startDate && new Date(startDate) > projectDate) {
          return false;
        }
        
        if (endDate && new Date(endDate) < projectDate) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  /**
   * Sort projects
   */
  sortProjects = (projects: Project[], sortConfig: ProjectSortConfig): Project[] => {
    return [...projects].sort((a, b) => {
      const direction = sortConfig.direction === 'ASC' ? 1 : -1;
      
      switch (sortConfig.option) {
        case 'TITLE':
          return a.title.localeCompare(b.title) * direction;
          
        case 'CREATED_DATE':
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
          
        case 'DUE_DATE':
          return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * direction;
          
        case 'PRIORITY': {
          const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, URGENT: 3 };
          return (priorityOrder[a.priority] - priorityOrder[b.priority]) * direction;
        }
          
        case 'PROGRESS':
          return (a.progress - b.progress) * direction;
          
        default:
          return 0;
      }
    });
  };
  
  /**
   * Save projects to local storage
   */
  private saveProjects = (projects: Project[]): void => {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  };
}

export default new ProjectService();