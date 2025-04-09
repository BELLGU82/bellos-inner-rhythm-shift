import api from './api';
import { v4 as uuidv4 } from 'uuid';

// Project status types
export type ProjectStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed';

// Project milestone type
export interface ProjectMilestone {
  title: string;
  completed: boolean;
}

// Project data structure
export interface Project {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: ProjectStatus;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  milestones: ProjectMilestone[];
  createdAt: string;
}

/**
 * ProjectService - handles all project-related API operations
 */
class ProjectService {
  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      // Simulated API call - in production would use the actual endpoint
      // const response = await api.get('/projects');
      // return response.data;
      
      // For demo purposes, return mock data
      return this.getMockProjects();
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
  
  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<Project> {
    try {
      // Simulated API call - in production would use the actual endpoint
      // const response = await api.get(`/projects/${id}`);
      // return response.data;
      
      // For demo purposes, look up in mock data
      const projects = this.getMockProjects();
      const project = projects.find(p => p.id === id);
      
      if (!project) {
        throw new Error(`Project with ID ${id} not found`);
      }
      
      return project;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new project
   */
  async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    try {
      // Create a new project object with generated ID and timestamp
      const newProject: Project = {
        ...project,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      
      // Simulated API call - in production would use the actual endpoint
      // const response = await api.post('/projects', newProject);
      // return response.data;
      
      // For demo purposes, simulate successful creation
      console.log('Project created:', newProject);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing project
   */
  async updateProject(project: Project): Promise<Project> {
    try {
      // Simulated API call - in production would use the actual endpoint
      // const response = await api.put(`/projects/${project.id}`, project);
      // return response.data;
      
      // For demo purposes, simulate successful update
      console.log('Project updated:', project);
      return project;
    } catch (error) {
      console.error(`Error updating project ${project.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      // Simulated API call - in production would use the actual endpoint
      // await api.delete(`/projects/${id}`);
      
      // For demo purposes, simulate successful deletion
      console.log(`Project ${id} deleted`);
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Update project progress
   */
  async updateProgress(id: string, progress: number): Promise<void> {
    try {
      // Simulated API call - in production would use the actual endpoint
      // await api.patch(`/projects/${id}/progress`, { progress });
      
      // For demo purposes, simulate successful progress update
      console.log(`Progress for project ${id} updated to ${progress}%`);
    } catch (error) {
      console.error(`Error updating progress for project ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Mark a project as completed
   */
  async completeProject(id: string): Promise<void> {
    try {
      // Simulated API call - in production would use the actual endpoint
      // await api.patch(`/projects/${id}/complete`);
      
      // For demo purposes, simulate successful completion
      console.log(`Project ${id} marked as completed`);
    } catch (error) {
      console.error(`Error completing project ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate mock projects for demonstration
   * In a real application, this would be replaced with actual API calls
   */
  private getMockProjects(): Project[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    return [
      {
        id: '1',
        title: 'Website Redesign',
        description: 'Completely overhaul the company website with a modern design and improved user experience.',
        dueDate: nextMonth.toISOString().split('T')[0],
        status: 'in_progress',
        priority: 'high',
        progress: 45,
        milestones: [
          { title: 'Design mockups', completed: true },
          { title: 'Frontend development', completed: true },
          { title: 'Content migration', completed: false },
          { title: 'Testing and QA', completed: false },
          { title: 'Launch', completed: false }
        ],
        createdAt: lastWeek.toISOString()
      },
      {
        id: '2',
        title: 'Mobile App Development',
        description: 'Create a cross-platform mobile application for iOS and Android.',
        dueDate: nextMonth.toISOString().split('T')[0],
        status: 'not_started',
        priority: 'medium',
        progress: 0,
        milestones: [
          { title: 'Requirements gathering', completed: false },
          { title: 'UI/UX design', completed: false },
          { title: 'Backend development', completed: false },
          { title: 'Frontend development', completed: false },
          { title: 'Testing', completed: false },
          { title: 'App store submission', completed: false }
        ],
        createdAt: today.toISOString()
      },
      {
        id: '3',
        title: 'Marketing Campaign',
        description: 'Plan and execute Q2 marketing campaign across social media, email, and content marketing.',
        dueDate: tomorrow.toISOString().split('T')[0],
        status: 'on_hold',
        priority: 'high',
        progress: 30,
        milestones: [
          { title: 'Strategy development', completed: true },
          { title: 'Content creation', completed: true },
          { title: 'Campaign setup', completed: false },
          { title: 'Launch campaign', completed: false },
          { title: 'Analyze results', completed: false }
        ],
        createdAt: lastWeek.toISOString()
      },
      {
        id: '4',
        title: 'Product Launch',
        description: 'Coordinate the launch of our new flagship product.',
        dueDate: nextWeek.toISOString().split('T')[0],
        status: 'in_progress',
        priority: 'high',
        progress: 65,
        milestones: [
          { title: 'Product testing', completed: true },
          { title: 'Marketing materials', completed: true },
          { title: 'Press release', completed: true },
          { title: 'Launch event planning', completed: false },
          { title: 'Post-launch support', completed: false }
        ],
        createdAt: lastWeek.toISOString()
      },
      {
        id: '5',
        title: 'Office Renovation',
        description: 'Renovate the main office space to accommodate team growth and improve work environment.',
        dueDate: nextMonth.toISOString().split('T')[0],
        status: 'completed',
        priority: 'medium',
        progress: 100,
        milestones: [
          { title: 'Design approval', completed: true },
          { title: 'Contractor selection', completed: true },
          { title: 'Construction phase', completed: true },
          { title: 'Furniture and equipment', completed: true },
          { title: 'Move-in', completed: true }
        ],
        createdAt: lastWeek.toISOString()
      }
    ];
  }
}

export default new ProjectService();