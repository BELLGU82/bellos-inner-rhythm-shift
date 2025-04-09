// src/services/projectService.ts
import { v4 as uuidv4 } from 'uuid';
import { Project, ProjectStatus, ProjectPriority, ProjectTask, ProjectMilestone, ProjectFilter, ProjectSortOption } from '../types/projects';

// Local storage keys
const PROJECTS_STORAGE_KEY = 'projects';
const PROJECT_CATEGORIES_KEY = 'projectCategories';
const PROJECT_TAGS_KEY = 'projectTags';

// Helper functions for localStorage
const getProjectsFromStorage = (): Project[] => {
  const projectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
  return projectsJson ? JSON.parse(projectsJson) : [];
};

const saveProjectsToStorage = (projects: Project[]): void => {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
};

// Calculate project progress based on completed tasks
const calculateProjectProgress = (tasks: ProjectTask[]): number => {
  if (tasks.length === 0) return 0;
  
  // Calculate based on task weights
  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
  if (totalWeight === 0) return 0;
  
  const completedWeight = tasks
    .filter(task => task.status === 'הושלם')
    .reduce((sum, task) => sum + task.weight, 0);
  
  return Math.round((completedWeight / totalWeight) * 100);
};

// CRUD operations
export const getAllProjects = (): Project[] => {
  return getProjectsFromStorage();
};

export const getProjectById = (id: string): Project | undefined => {
  const projects = getProjectsFromStorage();
  return projects.find(project => project.id === id);
};

export const getActiveProjects = (): Project[] => {
  const projects = getProjectsFromStorage();
  return projects.filter(project => !project.isArchived);
};

export const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress'>): Project => {
  const projects = getProjectsFromStorage();
  
  // Calculate initial progress
  const progress = calculateProjectProgress(projectData.tasks || []);
  
  const newProject: Project = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress,
    ...projectData
  };
  
  projects.push(newProject);
  saveProjectsToStorage(projects);
  
  // Update tags and categories
  if (projectData.category) {
    addCategory(projectData.category);
  }
  
  if (projectData.tags && projectData.tags.length > 0) {
    projectData.tags.forEach(tag => addTag(tag));
  }
  
  return newProject;
};

export const updateProject = (updatedProject: Project): Project => {
  const projects = getProjectsFromStorage();
  
  const projectIndex = projects.findIndex(project => project.id === updatedProject.id);
  
  if (projectIndex === -1) {
    throw new Error(`Project with id ${updatedProject.id} not found`);
  }
  
  // Recalculate progress
  const progress = calculateProjectProgress(updatedProject.tasks);
  
  // Update the project with new progress and timestamp
  const finalProject = {
    ...updatedProject,
    progress,
    updatedAt: new Date().toISOString()
  };
  
  projects[projectIndex] = finalProject;
  saveProjectsToStorage(projects);
  
  // Update tags and categories
  if (updatedProject.category) {
    addCategory(updatedProject.category);
  }
  
  if (updatedProject.tags && updatedProject.tags.length > 0) {
    updatedProject.tags.forEach(tag => addTag(tag));
  }
  
  return finalProject;
};

export const deleteProject = (id: string): void => {
  let projects = getProjectsFromStorage();
  projects = projects.filter(project => project.id !== id);
  saveProjectsToStorage(projects);
};

export const archiveProject = (id: string): Project | undefined => {
  const projects = getProjectsFromStorage();
  const projectIndex = projects.findIndex(project => project.id === id);
  
  if (projectIndex === -1) return undefined;
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    isArchived: true,
    updatedAt: new Date().toISOString()
  };
  
  saveProjectsToStorage(projects);
  return projects[projectIndex];
};

export const unarchiveProject = (id: string): Project | undefined => {
  const projects = getProjectsFromStorage();
  const projectIndex = projects.findIndex(project => project.id === id);
  
  if (projectIndex === -1) return undefined;
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    isArchived: false,
    updatedAt: new Date().toISOString()
  };
  
  saveProjectsToStorage(projects);
  return projects[projectIndex];
};

// Project status management
export const updateProjectStatus = (id: string, status: ProjectStatus): Project | undefined => {
  const projects = getProjectsFromStorage();
  const projectIndex = projects.findIndex(project => project.id === id);
  
  if (projectIndex === -1) return undefined;
  
  // Update completedAt if the status is 'הושלם'
  const completedAt = status === 'הושלם' ? new Date().toISOString() : undefined;
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    status,
    completedAt,
    updatedAt: new Date().toISOString()
  };
  
  saveProjectsToStorage(projects);
  return projects[projectIndex];
};

// Task management
export const addTaskToProject = (projectId: string, task: Omit<ProjectTask, 'id'>): Project | undefined => {
  const projects = getProjectsFromStorage();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) return undefined;
  
  const newTask: ProjectTask = {
    ...task,
    id: uuidv4()
  };
  
  projects[projectIndex].tasks.push(newTask);
  
  // Recalculate progress
  projects[projectIndex].progress = calculateProjectProgress(projects[projectIndex].tasks);
  projects[projectIndex].updatedAt = new Date().toISOString();
  
  saveProjectsToStorage(projects);
  return projects[projectIndex];
};

export const updateTaskInProject = (projectId: string, taskId: string, taskUpdate: Partial<ProjectTask>): Project | undefined => {
  const projects = getProjectsFromStorage();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) return undefined;
  
  const taskIndex = projects[projectIndex].tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) return undefined;
  
  // Update completedAt if the status is 'הושלם'
  let completedAt = projects[projectIndex].tasks[taskIndex].completedAt;
  if (taskUpdate.status === 'הושלם' && projects[projectIndex].tasks[taskIndex].status !== 'הושלם') {
    completedAt = new Date().toISOString();
  } else if (taskUpdate.status && taskUpdate.status !== 'הושלם') {
    completedAt = undefined;
  }
  
  projects[projectIndex].tasks[taskIndex] = {
    ...projects[projectIndex].tasks[taskIndex],
    ...taskUpdate,
    completedAt
  };
  
  // Recalculate progress
  projects[projectIndex].progress = calculateProjectProgress(projects[projectIndex].tasks);
  projects[projectIndex].updatedAt = new Date().toISOString();
  
  saveProjectsToStorage(projects);
  return projects[projectIndex];
};

export const removeTaskFromProject = (projectId: string, taskId: string): Project | undefined => {
  const projects = getProjectsFromStorage();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) return undefined;
  
  projects[projectIndex].tasks = projects[projectIndex].tasks.filter(task => task.id !== taskId);
  
  // Recalculate progress
  projects[projectIndex].progress = calculateProjectProgress(projects[projectIndex].tasks);
  projects[projectIndex].updatedAt = new Date().toISOString();
  
  saveProjectsToStorage(projects);
  return projects[projectIndex];
};

// Milestone management
export const addMilestoneToProject = (projectId: string, milestone: Omit<ProjectMilestone, 'id'>): Project | undefined => {
  const projects = getProjectsFromStorage();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) return undefined;
  
  const newMilestone: ProjectMilestone = {
    ...milestone,
    id: uuidv4()
  };
  
  projects[projectIndex].milestones.push(newMilestone);
  projects[projectIndex].updatedAt = new Date().toISOString();
  
  saveProjectsToStorage(projects);
  return projects[projectIndex];
};

export const updateMilestoneInProject = (projectId: string, milestoneId: string, milestoneUpdate: Partial<ProjectMilestone>): Project | undefined => {
  const projects = getProjectsFromStorage();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) return undefined;
  
  const milestoneIndex = projects[projectIndex].milestones.findIndex(milestone => milestone.id === milestoneId);
  
  if (milestoneIndex === -1) return undefined;
  
  projects[projectIndex].milestones[milestoneIndex] = {
    ...projects[projectIndex].milestones[milestoneIndex],
    ...milestoneUpdate
  };
  
  projects[projectIndex].updatedAt = new Date().toISOString();
  
  saveProjectsToStorage(projects);
  return projects[projectIndex];
};

export const removeMilestoneFromProject = (projectId: string, milestoneId: string): Project | undefined => {
  const projects = getProjectsFromStorage();
  const projectIndex = projects.findIndex(project => project.id === projectId);
  
  if (projectIndex === -1) return undefined;
  
  projects[projectIndex].milestones = projects[projectIndex].milestones.filter(milestone => milestone.id !== milestoneId);
  projects[projectIndex].updatedAt = new Date().toISOString();
  
  saveProjectsToStorage(projects);
  return projects[projectIndex];
};

// Filter and search functions
export const filterProjects = (filters: ProjectFilter): Project[] => {
  let projects = getProjectsFromStorage();
  
  // Apply status filter
  if (filters.status && filters.status.length > 0) {
    projects = projects.filter(project => filters.status!.includes(project.status));
  }
  
  // Apply category filter
  if (filters.category && filters.category.length > 0) {
    projects = projects.filter(project => filters.category!.includes(project.category));
  }
  
  // Apply priority filter
  if (filters.priority && filters.priority.length > 0) {
    projects = projects.filter(project => filters.priority!.includes(project.priority));
  }
  
  // Apply date range filter
  if (filters.dateRange) {
    if (filters.dateRange.startDate) {
      const startDate = new Date(filters.dateRange.startDate);
      projects = projects.filter(project => new Date(project.startDate) >= startDate);
    }
    
    if (filters.dateRange.endDate) {
      const endDate = new Date(filters.dateRange.endDate);
      projects = projects.filter(project => 
        project.dueDate ? new Date(project.dueDate) <= endDate : true
      );
    }
  }
  
  // Apply search term
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    projects = projects.filter(project =>
      project.title.toLowerCase().includes(term) ||
      project.description.toLowerCase().includes(term) ||
      project.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }
  
  // Apply tag filter
  if (filters.tags && filters.tags.length > 0) {
    projects = projects.filter(project =>
      filters.tags!.some(tag => project.tags.includes(tag))
    );
  }
  
  // Apply archive filter
  if (!filters.includeArchived) {
    projects = projects.filter(project => !project.isArchived);
  }
  
  // Apply team filter
  if (filters.team && filters.team.length > 0) {
    projects = projects.filter(project =>
      filters.team!.some(member => project.team.includes(member))
    );
  }
  
  return projects;
};

export const sortProjects = (projects: Project[], sortOption: ProjectSortOption): Project[] => {
  return [...projects].sort((a, b) => {
    let comparison = 0;
    
    switch (sortOption.field) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'startDate':
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        break;
      case 'priority':
        const priorityOrder = { 'דחופה': 0, 'גבוהה': 1, 'בינונית': 2, 'נמוכה': 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'status':
        const statusOrder = { 'בתכנון': 0, 'בתהליך': 1, 'מעוכב': 2, 'הושלם': 3, 'בוטל': 4 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      case 'progress':
        comparison = a.progress - b.progress;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    
    return sortOption.direction === 'asc' ? comparison : -comparison;
  });
};

// Category management
export const getAllCategories = (): string[] => {
  const categories = localStorage.getItem(PROJECT_CATEGORIES_KEY);
  
  if (categories) {
    return JSON.parse(categories);
  }
  
  // Default categories
  const defaultCategories = ['כללי', 'עסקי', 'אישי', 'פיתוח', 'שיווק', 'תוכן', 'אחר'];
  localStorage.setItem(PROJECT_CATEGORIES_KEY, JSON.stringify(defaultCategories));
  
  return defaultCategories;
};

export const addCategory = (category: string): string[] => {
  const categories = getAllCategories();
  
  if (!categories.includes(category)) {
    categories.push(category);
    localStorage.setItem(PROJECT_CATEGORIES_KEY, JSON.stringify(categories));
  }
  
  return categories;
};

export const removeCategory = (category: string): string[] => {
  if (category === 'כללי') {
    throw new Error('לא ניתן למחוק את הקטגוריה "כללי"');
  }
  
  let categories = getAllCategories();
  categories = categories.filter(c => c !== category);
  
  localStorage.setItem(PROJECT_CATEGORIES_KEY, JSON.stringify(categories));
  
  // Update all projects with this category to 'כללי'
  const projects = getProjectsFromStorage();
  let hasChanges = false;
  
  projects.forEach(project => {
    if (project.category === category) {
      project.category = 'כללי';
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    saveProjectsToStorage(projects);
  }
  
  return categories;
};

// Tag management
export const getAllTags = (): string[] => {
  const tags = localStorage.getItem(PROJECT_TAGS_KEY);
  
  if (tags) {
    return JSON.parse(tags);
  }
  
  return [];
};

export const addTag = (tag: string): string[] => {
  const tags = getAllTags();
  
  if (!tags.includes(tag)) {
    tags.push(tag);
    localStorage.setItem(PROJECT_TAGS_KEY, JSON.stringify(tags));
  }
  
  return tags;
};

export const removeTag = (tag: string): string[] => {
  let tags = getAllTags();
  tags = tags.filter(t => t !== tag);
  
  localStorage.setItem(PROJECT_TAGS_KEY, JSON.stringify(tags));
  
  // Remove this tag from all projects
  const projects = getProjectsFromStorage();
  let hasChanges = false;
  
  projects.forEach(project => {
    if (project.tags.includes(tag)) {
      project.tags = project.tags.filter(t => t !== tag);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    saveProjectsToStorage(projects);
  }
  
  return tags;
};

// Statistics
export const getProjectsStatistics = () => {
  const projects = getProjectsFromStorage();
  
  const total = projects.length;
  const active = projects.filter(p => !p.isArchived).length;
  const completed = projects.filter(p => p.status === 'הושלם').length;
  const inProgress = projects.filter(p => p.status === 'בתהליך').length;
  const delayed = projects.filter(p => p.status === 'מעוכב').length;
  const planned = projects.filter(p => p.status === 'בתכנון').length;
  const canceled = projects.filter(p => p.status === 'בוטל').length;
  
  // Calculate average progress for active projects
  const activeProjects = projects.filter(p => !p.isArchived && p.status !== 'הושלם' && p.status !== 'בוטל');
  const averageProgress = activeProjects.length > 0
    ? Math.round(activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length)
    : 0;
  
  // Projects by priority
  const highPriority = projects.filter(p => p.priority === 'גבוהה' || p.priority === 'דחופה').length;
  const mediumPriority = projects.filter(p => p.priority === 'בינונית').length;
  const lowPriority = projects.filter(p => p.priority === 'נמוכה').length;
  
  // Upcoming deadlines (next 7 days)
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const upcomingDeadlines = projects.filter(p => 
    p.dueDate && 
    !p.isArchived && 
    p.status !== 'הושלם' && 
    p.status !== 'בוטל' &&
    new Date(p.dueDate) >= now &&
    new Date(p.dueDate) <= nextWeek
  ).length;
  
  // Overdue projects
  const overdueProjects = projects.filter(p => 
    p.dueDate && 
    !p.isArchived && 
    p.status !== 'הושלם' && 
    p.status !== 'בוטל' &&
    new Date(p.dueDate) < now
  ).length;
  
  return {
    total,
    active,
    completed,
    inProgress,
    delayed,
    planned,
    canceled,
    averageProgress,
    highPriority,
    mediumPriority,
    lowPriority,
    upcomingDeadlines,
    overdueProjects
  };
};

// Initialize system with sample data if empty
export const initializeProjectSystem = (): void => {
  const projects = getProjectsFromStorage();
  
  if (projects.length === 0) {
    // Add some sample projects
    const sampleProjects: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress'>[] = [
      {
        title: 'פיתוח אתר חברה',
        description: 'עיצוב ופיתוח אתר אינטרנט חדש לחברה, כולל מערכת ניהול תוכן',
        status: 'בתהליך',
        priority: 'גבוהה',
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
        category: 'פיתוח',
        tags: ['אתר', 'פיתוח', 'עיצוב'],
        tasks: [
          {
            id: uuidv4(),
            title: 'עיצוב ממשק משתמש',
            description: 'עיצוב UI/UX לכל הדפים באתר',
            status: 'הושלם',
            weight: 20,
            completedAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'פיתוח צד קדמי',
            description: 'פיתוח צד לקוח עם React',
            status: 'בתהליך',
            weight: 30
          },
          {
            id: uuidv4(),
            title: 'פיתוח צד שרת',
            description: 'פיתוח API ומערכת ניהול תוכן',
            status: 'בתהליך',
            weight: 30
          },
          {
            id: uuidv4(),
            title: 'בדיקות ושיפורים',
            description: 'בדיקות מקיפות ותיקון באגים',
            status: 'לביצוע',
            weight: 20
          }
        ],
        milestones: [
          {
            id: uuidv4(),
            title: 'השלמת עיצוב',
            dueDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
            completedAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'השלמת פיתוח צד לקוח',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'השלמת פיתוח צד שרת',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'השקה סופית',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString()
          }
        ],
        team: ['יוסי כהן', 'מיכל לוי', 'דני גולד'],
        owner: 'יוסי כהן',
        budget: 50000,
        actualCost: 25000,
        isArchived: false
      },
      {
        title: 'קמפיין שיווקי למוצר חדש',
        description: 'תכנון וביצוע קמפיין שיווקי למוצר חדש שיושק בחודש הבא',
        status: 'בתכנון',
        priority: 'בינונית',
        startDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(),
        category: 'שיווק',
        tags: ['שיווק', 'מדיה חברתית', 'פרסום'],
        tasks: [
          {
            id: uuidv4(),
            title: 'מחקר שוק',
            description: 'מחקר קהל יעד ומתחרים',
            status: 'הושלם',
            weight: 10,
            completedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'יצירת אסטרטגיה',
            description: 'פיתוח אסטרטגיית שיווק מקיפה',
            status: 'בתהליך',
            weight: 20
          },
          {
            id: uuidv4(),
            title: 'הכנת חומרים שיווקיים',
            description: 'עיצוב באנרים, פוסטים ותוכן לקמפיין',
            status: 'לביצוע',
            weight: 30
          },
          {
            id: uuidv4(),
            title: 'הפעלת הקמפיין',
            description: 'פרסום הקמפיין בכל הפלטפורמות',
            status: 'לביצוע',
            weight: 30
          },
          {
            id: uuidv4(),
            title: 'מדידה וניתוח',
            description: 'מדידת ביצועי הקמפיין ודיווח',
            status: 'לביצוע',
            weight: 10
          }
        ],
        milestones: [
          {
            id: uuidv4(),
            title: 'אישור אסטרטגיה',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'השלמת חומרים',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'השקת קמפיין',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString()
          }
        ],
        team: ['שירה לביא', 'אורי שמש', 'נועה גל'],
        owner: 'שירה לביא',
        budget: 35000,
        isArchived: false
      },
      {
        title: 'הדרכת עובדים חדשים',
        description: 'פיתוח והעברת תכנית הדרכה לעובדים חדשים',
        status: 'הושלם',
        priority: 'נמוכה',
        startDate: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        completedAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        category: 'משאבי אנוש',
        tags: ['הדרכה', 'עובדים', 'למידה'],
        tasks: [
          {
            id: uuidv4(),
            title: 'פיתוח תכנית הדרכה',
            description: 'יצירת מערך הדרכה מפורט',
            status: 'הושלם',
            weight: 30,
            completedAt: new Date(new Date().setDate(new Date().getDate() - 45)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'הכנת חומרי למידה',
            description: 'יצירת חומרי עזר ומצגות',
            status: 'הושלם',
            weight: 30,
            completedAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'העברת הדרכות',
            description: 'העברת סדנאות הדרכה לקבוצות עובדים',
            status: 'הושלם',
            weight: 30,
            completedAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'איסוף משוב ושיפור',
            description: 'איסוף משוב מהמשתתפים ושיפור התכנית',
            status: 'הושלם',
            weight: 10,
            completedAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()
          }
        ],
        milestones: [
          {
            id: uuidv4(),
            title: 'אישור תכנית',
            dueDate: new Date(new Date().setDate(new Date().getDate() - 50)).toISOString(),
            completedAt: new Date(new Date().setDate(new Date().getDate() - 50)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'סיום פיתוח חומרים',
            dueDate: new Date(new Date().setDate(new Date().getDate() - 35)).toISOString(),
            completedAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
          },
          {
            id: uuidv4(),
            title: 'סיום הדרכות',
            dueDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
            completedAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString()
          }
        ],
        team: ['רותי חן', 'אבי יונה'],
        owner: 'רותי חן',
        budget: 15000,
        actualCost: 14500,
        isArchived: false
      }
    ];
    
    sampleProjects.forEach(project => createProject(project));
  }
};