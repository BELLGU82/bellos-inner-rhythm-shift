import { Project, Milestone } from '../types/Project';
import { v4 as uuidv4 } from 'uuid';

// Mock data for development 
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'פיתוח אפליקציה',
    description: 'פיתוח אפליקציית מובייל לניהול משימות ופרויקטים',
    status: 'בתהליך',
    progress: 65,
    dueDate: '2025-06-30',
    createdAt: '2025-01-15',
    milestones: [
      { name: 'אפיון ותכנון', completed: true },
      { name: 'עיצוב ממשק', completed: true },
      { name: 'פיתוח', completed: false },
      { name: 'בדיקות', completed: false },
      { name: 'השקה', completed: false },
    ],
  },
  {
    id: '2',
    name: 'שיווק דיגיטלי',
    description: 'פיתוח אסטרטגיית שיווק דיגיטלי לרבעון הבא',
    status: 'לא התחיל',
    progress: 0,
    dueDate: '2025-05-15',
    createdAt: '2025-03-01',
    milestones: [
      { name: 'מחקר שוק', completed: false },
      { name: 'גיבוש אסטרטגיה', completed: false },
      { name: 'יצירת תוכן', completed: false },
      { name: 'השקת קמפיין', completed: false },
    ],
  },
  {
    id: '3',
    name: 'פיתוח קורס הכשרה',
    description: 'פיתוח קורס הכשרה פנים-ארגוני בנושא אבטחת מידע',
    status: 'הושלם',
    progress: 100,
    dueDate: '2025-02-28',
    createdAt: '2025-01-05',
    milestones: [
      { name: 'מחקר וגיבוש תכנים', completed: true },
      { name: 'יצירת מצגות', completed: true },
      { name: 'פיתוח תרגולים', completed: true },
      { name: 'העברת הקורס', completed: true },
    ],
  },
];

export class ProjectService {
  private storage: Storage;
  private projects: Project[];

  constructor() {
    this.storage = localStorage;
    this.projects = this.loadProjects();
    
    // Initialize with mock data if no projects exist
    if (this.projects.length === 0) {
      this.projects = MOCK_PROJECTS;
      this.saveProjects();
    }
  }

  private loadProjects(): Project[] {
    const projectsJson = this.storage.getItem('projects');
    return projectsJson ? JSON.parse(projectsJson) : [];
  }

  private saveProjects(): void {
    this.storage.setItem('projects', JSON.stringify(this.projects));
  }

  public async getAllProjects(): Promise<Project[]> {
    // Simulating API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([...this.projects]);
      }, 300);
    });
  }

  public async getProjectById(id: string): Promise<Project | null> {
    // Simulating API call
    return new Promise(resolve => {
      setTimeout(() => {
        const project = this.projects.find(p => p.id === id) || null;
        resolve(project ? { ...project } : null);
      }, 300);
    });
  }

  public async createProject(projectData: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    // Simulating API call
    return new Promise(resolve => {
      setTimeout(() => {
        const newProject: Project = {
          ...projectData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        
        this.projects.push(newProject);
        this.saveProjects();
        
        resolve({ ...newProject });
      }, 300);
    });
  }

  public async updateProject(project: Project): Promise<Project> {
    // Simulating API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.projects.findIndex(p => p.id === project.id);
        
        if (index === -1) {
          reject(new Error('Project not found'));
          return;
        }
        
        this.projects[index] = { ...project };
        this.saveProjects();
        
        resolve({ ...project });
      }, 300);
    });
  }

  public async deleteProject(id: string): Promise<void> {
    // Simulating API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.projects.findIndex(p => p.id === id);
        
        if (index === -1) {
          reject(new Error('Project not found'));
          return;
        }
        
        this.projects.splice(index, 1);
        this.saveProjects();
        
        resolve();
      }, 300);
    });
  }

  public async updateProgress(id: string, progress: number): Promise<Project> {
    // Simulating API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.projects.findIndex(p => p.id === id);
        
        if (index === -1) {
          reject(new Error('Project not found'));
          return;
        }
        
        const project = { ...this.projects[index] };
        project.progress = progress;
        
        // Update status based on progress
        if (progress === 0) {
          project.status = 'לא התחיל';
        } else if (progress === 100) {
          project.status = 'הושלם';
        } else {
          project.status = 'בתהליך';
        }
        
        this.projects[index] = project;
        this.saveProjects();
        
        resolve({ ...project });
      }, 300);
    });
  }

  public async completeProject(id: string): Promise<Project> {
    // Simulating API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.projects.findIndex(p => p.id === id);
        
        if (index === -1) {
          reject(new Error('Project not found'));
          return;
        }
        
        const project = { ...this.projects[index] };
        project.status = 'הושלם';
        project.progress = 100;
        
        // Mark all milestones as completed
        if (project.milestones && project.milestones.length > 0) {
          project.milestones = project.milestones.map(m => ({
            ...m,
            completed: true
          }));
        }
        
        this.projects[index] = project;
        this.saveProjects();
        
        resolve({ ...project });
      }, 300);
    });
  }

  public async updateMilestone(
    projectId: string, 
    milestoneIndex: number, 
    updatedMilestone: Milestone
  ): Promise<Project> {
    // Simulating API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.projects.findIndex(p => p.id === projectId);
        
        if (index === -1) {
          reject(new Error('Project not found'));
          return;
        }
        
        const project = { ...this.projects[index] };
        
        if (!project.milestones || milestoneIndex >= project.milestones.length) {
          reject(new Error('Milestone not found'));
          return;
        }
        
        // Update the specific milestone
        project.milestones[milestoneIndex] = updatedMilestone;
        
        // Recalculate progress based on completed milestones
        if (project.milestones.length > 0) {
          const completedCount = project.milestones.filter(m => m.completed).length;
          project.progress = Math.round((completedCount / project.milestones.length) * 100);
          
          // Update status based on progress
          if (project.progress === 0) {
            project.status = 'לא התחיל';
          } else if (project.progress === 100) {
            project.status = 'הושלם';
          } else {
            project.status = 'בתהליך';
          }
        }
        
        this.projects[index] = project;
        this.saveProjects();
        
        resolve({ ...project });
      }, 300);
    });
  }
}