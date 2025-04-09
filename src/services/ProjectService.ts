import { Project } from '../types/Project';

// Local storage key for projects
const PROJECTS_STORAGE_KEY = 'birs_projects';

/**
 * Service for managing projects
 */
export const ProjectService = {
  /**
   * Get all projects
   * @returns Promise<Project[]>
   */
  getProjects: async (): Promise<Project[]> => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        const projects: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
        resolve(projects);
      }, 300);
    });
  },

  /**
   * Get a single project by ID
   * @param id Project ID
   * @returns Promise<Project | null>
   */
  getProjectById: async (id: string): Promise<Project | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        const projects: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
        const project = projects.find((p) => p.id === id) || null;
        resolve(project);
      }, 300);
    });
  },

  /**
   * Add a new project
   * @param project Project to add
   * @returns Promise<Project>
   */
  addProject: async (project: Project): Promise<Project> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        const projects: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
        
        // Add the new project to the list
        projects.push(project);
        
        // Save back to local storage
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
        
        resolve(project);
      }, 300);
    });
  },

  /**
   * Update an existing project
   * @param project Updated project
   * @returns Promise<Project>
   */
  updateProject: async (project: Project): Promise<Project> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        const projects: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
        
        // Find the index of the project to update
        const index = projects.findIndex((p) => p.id === project.id);
        
        if (index === -1) {
          reject(new Error(`Project with ID ${project.id} not found`));
          return;
        }
        
        // Update the project
        projects[index] = project;
        
        // Save back to local storage
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
        
        resolve(project);
      }, 300);
    });
  },

  /**
   * Delete a project by ID
   * @param id Project ID to delete
   * @returns Promise<void>
   */
  deleteProject: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        const projects: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
        
        // Find the index of the project to delete
        const index = projects.findIndex((p) => p.id === id);
        
        if (index === -1) {
          reject(new Error(`Project with ID ${id} not found`));
          return;
        }
        
        // Remove the project
        projects.splice(index, 1);
        
        // Save back to local storage
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
        
        resolve();
      }, 300);
    });
  },

  /**
   * Update project status
   * @param id Project ID
   * @param status New status
   * @returns Promise<Project>
   */
  updateProjectStatus: async (id: string, status: Project['status']): Promise<Project> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const project = await ProjectService.getProjectById(id);
          
          if (!project) {
            reject(new Error(`Project with ID ${id} not found`));
            return;
          }
          
          const updatedProject = {
            ...project,
            status,
            updatedAt: new Date().toISOString(),
            completedAt: status === 'COMPLETED' ? new Date().toISOString() : null
          };
          
          const result = await ProjectService.updateProject(updatedProject);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Update project progress
   * @param id Project ID
   * @param progress New progress value (0-100)
   * @returns Promise<Project>
   */
  updateProjectProgress: async (id: string, progress: number): Promise<Project> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const project = await ProjectService.getProjectById(id);
          
          if (!project) {
            reject(new Error(`Project with ID ${id} not found`));
            return;
          }
          
          // Ensure progress is between 0 and 100
          const validProgress = Math.min(100, Math.max(0, progress));
          
          // Determine status based on progress
          let status = project.status;
          if (validProgress === 100 && project.status !== 'COMPLETED') {
            status = 'COMPLETED';
          } else if (validProgress > 0 && validProgress < 100 && project.status === 'NOT_STARTED') {
            status = 'IN_PROGRESS';
          }
          
          const updatedProject = {
            ...project,
            progress: validProgress,
            status,
            updatedAt: new Date().toISOString(),
            completedAt: status === 'COMPLETED' ? new Date().toISOString() : null
          };
          
          const result = await ProjectService.updateProject(updatedProject);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },
  
  /**
   * Add a milestone to a project
   * @param projectId Project ID
   * @param milestone Milestone to add
   * @returns Promise<Project>
   */
  addMilestone: async (projectId: string, milestone: Project['milestones'][0]): Promise<Project> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const project = await ProjectService.getProjectById(projectId);
          
          if (!project) {
            reject(new Error(`Project with ID ${projectId} not found`));
            return;
          }
          
          const updatedProject = {
            ...project,
            milestones: [...project.milestones, milestone],
            updatedAt: new Date().toISOString()
          };
          
          const result = await ProjectService.updateProject(updatedProject);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Update a milestone in a project
   * @param projectId Project ID
   * @param milestoneId Milestone ID
   * @param updatedMilestone Updated milestone data
   * @returns Promise<Project>
   */
  updateMilestone: async (
    projectId: string,
    milestoneId: string,
    updatedMilestone: Partial<Project['milestones'][0]>
  ): Promise<Project> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const project = await ProjectService.getProjectById(projectId);
          
          if (!project) {
            reject(new Error(`Project with ID ${projectId} not found`));
            return;
          }
          
          const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
          
          if (milestoneIndex === -1) {
            reject(new Error(`Milestone with ID ${milestoneId} not found in project`));
            return;
          }
          
          const updatedMilestones = [...project.milestones];
          updatedMilestones[milestoneIndex] = {
            ...updatedMilestones[milestoneIndex],
            ...updatedMilestone
          };
          
          const updatedProject = {
            ...project,
            milestones: updatedMilestones,
            updatedAt: new Date().toISOString()
          };
          
          const result = await ProjectService.updateProject(updatedProject);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Delete a milestone from a project
   * @param projectId Project ID
   * @param milestoneId Milestone ID to delete
   * @returns Promise<Project>
   */
  deleteMilestone: async (projectId: string, milestoneId: string): Promise<Project> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const project = await ProjectService.getProjectById(projectId);
          
          if (!project) {
            reject(new Error(`Project with ID ${projectId} not found`));
            return;
          }
          
          const updatedMilestones = project.milestones.filter(m => m.id !== milestoneId);
          
          const updatedProject = {
            ...project,
            milestones: updatedMilestones,
            updatedAt: new Date().toISOString()
          };
          
          const result = await ProjectService.updateProject(updatedProject);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Complete or uncomplete a milestone
   * @param projectId Project ID
   * @param milestoneId Milestone ID
   * @param completed Completion status
   * @returns Promise<Project>
   */
  toggleMilestoneCompletion: async (
    projectId: string,
    milestoneId: string,
    completed: boolean
  ): Promise<Project> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const project = await ProjectService.getProjectById(projectId);
          
          if (!project) {
            reject(new Error(`Project with ID ${projectId} not found`));
            return;
          }
          
          const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
          
          if (milestoneIndex === -1) {
            reject(new Error(`Milestone with ID ${milestoneId} not found in project`));
            return;
          }
          
          const updatedMilestones = [...project.milestones];
          updatedMilestones[milestoneIndex] = {
            ...updatedMilestones[milestoneIndex],
            completed,
            completedAt: completed ? new Date().toISOString() : null
          };
          
          // Calculate progress based on completed milestones
          const totalMilestones = updatedMilestones.length;
          const completedMilestones = updatedMilestones.filter(m => m.completed).length;
          const progress = totalMilestones > 0 
            ? Math.round((completedMilestones / totalMilestones) * 100) 
            : project.progress;
          
          // Update status based on progress if needed
          let status = project.status;
          if (progress === 100 && project.status !== 'COMPLETED' && project.status !== 'CANCELLED') {
            status = 'COMPLETED';
          } else if (progress > 0 && progress < 100 && project.status === 'NOT_STARTED') {
            status = 'IN_PROGRESS';
          }
          
          const updatedProject = {
            ...project,
            milestones: updatedMilestones,
            progress,
            status,
            updatedAt: new Date().toISOString(),
            completedAt: status === 'COMPLETED' ? new Date().toISOString() : project.completedAt
          };
          
          const result = await ProjectService.updateProject(updatedProject);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Add sample projects for testing
   * @returns Promise<Project[]>
   */
  addSampleProjects: async (): Promise<Project[]> => {
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    const oneWeekFromNow = new Date(now);
    oneWeekFromNow.setDate(now.getDate() + 7);
    
    const twoWeeksFromNow = new Date(now);
    twoWeeksFromNow.setDate(now.getDate() + 14);
    
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setMonth(now.getMonth() + 1);
    
    const sampleProjects: Project[] = [
      {
        id: '1',
        title: 'פיתוח אפליקציית תזכורות',
        description: 'יצירת יישום אינטראקטיבי לניהול תזכורות יומיות וניהול משימות אישיות.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
        dueDate: oneWeekFromNow.toISOString(),
        completedAt: null,
        progress: 60,
        tags: ['פיתוח', 'אפליקציה', 'React'],
        milestones: [
          {
            id: '101',
            title: 'עיצוב ממשק',
            description: 'יצירת מוקאפים ועיצוב UI/UX',
            dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
            completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '102',
            title: 'פיתוח פרונטאנד',
            description: 'יצירת קומפוננטות React',
            dueDate: threeDaysFromNow.toISOString(),
            completed: false,
            completedAt: null
          },
          {
            id: '103',
            title: 'אינטגרציה',
            description: 'חיבור מערכות',
            dueDate: oneWeekFromNow.toISOString(),
            completed: false,
            completedAt: null
          }
        ]
      },
      {
        id: '2',
        title: 'עיצוב לוגו חדש',
        description: 'עיצוב לוגו מודרני וייחודי עבור פרויקט הבא של החברה.',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 100,
        tags: ['עיצוב', 'לוגו', 'מיתוג'],
        milestones: [
          {
            id: '201',
            title: 'חקר מתחרים',
            description: 'ניתוח לוגואים קיימים בשוק',
            dueDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
            completedAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '202',
            title: 'סקיצות ראשוניות',
            description: 'יצירת גרסאות ראשוניות',
            dueDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
            completedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '203',
            title: 'עיצוב סופי',
            description: 'יצירת לוגו סופי',
            dueDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
            completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: '3',
        title: 'סקר שוק למוצר חדש',
        description: 'ביצוע מחקר שוק מקיף לבחינת הפוטנציאל של המוצר החדש.',
        status: 'NOT_STARTED',
        priority: 'LOW',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        dueDate: twoWeeksFromNow.toISOString(),
        completedAt: null,
        progress: 0,
        tags: ['מחקר', 'שיווק', 'אנליטיקס'],
        milestones: [
          {
            id: '301',
            title: 'יצירת שאלון',
            description: 'בניית שאלון מחקר',
            dueDate: threeDaysFromNow.toISOString(),
            completed: false,
            completedAt: null
          },
          {
            id: '302',
            title: 'איסוף נתונים',
            description: 'הפצת השאלון ואיסוף תשובות',
            dueDate: oneWeekFromNow.toISOString(),
            completed: false,
            completedAt: null
          },
          {
            id: '303',
            title: 'ניתוח והסקת מסקנות',
            description: 'ניתוח הנתונים והפקת דוח מסכם',
            dueDate: twoWeeksFromNow.toISOString(),
            completed: false,
            completedAt: null
          }
        ]
      },
      {
        id: '4',
        title: 'השקת קמפיין פרסומי',
        description: 'תכנון וביצוע קמפיין פרסומי למוצר הדגל של החברה ברשתות החברתיות.',
        status: 'ON_HOLD',
        priority: 'HIGH',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: oneMonthFromNow.toISOString(),
        completedAt: null,
        progress: 30,
        tags: ['שיווק', 'פרסום', 'מדיה חברתית'],
        milestones: [
          {
            id: '401',
            title: 'הגדרת קהלי יעד',
            description: 'ניתוח קהל היעד והגדרת פרסונות',
            dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
            completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '402',
            title: 'עיצוב חומרים',
            description: 'יצירת באנרים ופוסטים',
            dueDate: oneWeekFromNow.toISOString(),
            completed: false,
            completedAt: null
          },
          {
            id: '403',
            title: 'הגדרת תקציב',
            description: 'תכנון תקציבי לפלטפורמות השונות',
            dueDate: twoWeeksFromNow.toISOString(),
            completed: false,
            completedAt: null
          },
          {
            id: '404',
            title: 'השקת הקמפיין',
            description: 'העלאת הקמפיין לאוויר',
            dueDate: oneMonthFromNow.toISOString(),
            completed: false,
            completedAt: null
          }
        ]
      },
      {
        id: '5',
        title: 'גיוס עובדים חדשים',
        description: 'איתור, ראיון וגיוס מפתחים חדשים למחלקת הפיתוח.',
        status: 'CANCELLED',
        priority: 'MEDIUM',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        progress: 50,
        tags: ['משאבי אנוש', 'גיוס', 'פיתוח'],
        milestones: [
          {
            id: '501',
            title: 'כתיבת הגדרות תפקיד',
            description: 'הגדרת דרישות ותחומי אחריות',
            dueDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
            completedAt: new Date(now.getTime() - 26 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '502',
            title: 'פרסום משרות',
            description: 'פרסום באתרי דרושים',
            dueDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
            completedAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '503',
            title: 'ראיונות',
            description: 'קיום ראיונות למועמדים',
            dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            completedAt: null
          }
        ]
      }
    ];

    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(sampleProjects));
        resolve(sampleProjects);
      }, 300);
    });
  },

  /**
   * Clear all projects data
   * @returns Promise<void>
   */
  clearProjects: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem(PROJECTS_STORAGE_KEY);
        resolve();
      }, 300);
    });
  }
};