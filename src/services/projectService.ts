
import { v4 as uuidv4 } from 'uuid';
import { Project, Milestone } from '../types/Project';
import { supabase } from '../integrations/supabase/client';

export class ProjectService {
  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    try {
      // Create the projects table if it doesn't exist
      await this.ensureProjectsTableExists();
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      
      // Convert the data to match our Project type
      return (data || []).map(item => ({
        id: item.id || uuidv4(),
        name: item.name || item.title || '',
        description: item.description || '',
        status: item.status || 'לא התחיל',
        progress: item.progress || 0,
        createdAt: item.createdAt || new Date().toISOString(),
        dueDate: item.dueDate,
        milestones: item.milestones || []
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  /**
   * Get a project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    try {
      await this.ensureProjectsTableExists();
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Convert the data to match our Project type
      return {
        id: data.id || id,
        name: data.name || data.title || '',
        description: data.description || '',
        status: data.status || 'לא התחיל',
        progress: data.progress || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        dueDate: data.dueDate,
        milestones: data.milestones || []
      };
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new project
   */
  async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    try {
      await this.ensureProjectsTableExists();
      
      const newProject: Project = {
        ...project,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        milestones: []
      };

      const { data, error } = await supabase
        .from('projects')
        .insert({
          id: newProject.id,
          name: newProject.name,
          description: newProject.description,
          status: newProject.status,
          progress: newProject.progress,
          createdAt: newProject.createdAt,
          dueDate: newProject.dueDate,
          milestones: newProject.milestones
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Return the created project or the local one as fallback
      return data ? {
        id: data.id,
        name: data.name || data.title || '',
        description: data.description || '',
        status: data.status || 'לא התחיל',
        progress: data.progress || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        dueDate: data.dueDate,
        milestones: data.milestones || []
      } : newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      // Return the local object as fallback
      return {
        ...project,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        milestones: []
      };
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(project: Project): Promise<Project> {
    try {
      await this.ensureProjectsTableExists();
      
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: project.name,
          description: project.description,
          status: project.status,
          progress: project.progress,
          dueDate: project.dueDate,
          milestones: project.milestones
        })
        .eq('id', project.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Return the updated project or the input one as fallback
      return data ? {
        id: data.id,
        name: data.name || data.title || '',
        description: data.description || '',
        status: data.status || 'לא התחיל',
        progress: data.progress || 0,
        createdAt: data.createdAt || project.createdAt,
        dueDate: data.dueDate,
        milestones: data.milestones || []
      } : project;
    } catch (error) {
      console.error(`Error updating project with ID ${project.id}:`, error);
      return project; // Return the input object as fallback
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<boolean> {
    try {
      await this.ensureProjectsTableExists();
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting project with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Mark a project as complete
   */
  async completeProject(id: string): Promise<Project | null> {
    try {
      await this.ensureProjectsTableExists();
      
      const { data, error } = await supabase
        .from('projects')
        .update({
          status: 'הושלם',
          progress: 100
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Convert the data to match our Project type
      return {
        id: data.id,
        name: data.name || data.title || '',
        description: data.description || '',
        status: data.status || 'הושלם',
        progress: data.progress || 100,
        createdAt: data.createdAt || new Date().toISOString(),
        dueDate: data.dueDate,
        milestones: data.milestones || []
      };
    } catch (error) {
      console.error(`Error completing project with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Update a milestone in a project
   */
  async updateMilestone(
    projectId: string,
    milestoneIndex: number,
    milestone: Milestone
  ): Promise<Project | null> {
    try {
      // First get the current project
      const project = await this.getProjectById(projectId);
      if (!project) return null;
      
      // Update the milestone
      const milestones = [...project.milestones];
      milestones[milestoneIndex] = milestone;
      
      // Update the project with modified milestones
      const updatedProject = {
        ...project,
        milestones
      };
      
      return await this.updateProject(updatedProject);
    } catch (error) {
      console.error(`Error updating milestone in project ${projectId}:`, error);
      return null;
    }
  }
  
  /**
   * Ensure the projects table exists and has the correct schema
   * This is a helper method to avoid errors when the table doesn't exist
   */
  private async ensureProjectsTableExists() {
    try {
      // Try to create the table if it doesn't exist using RPC
      // This is a simplified approach - in a real app, you'd use migrations
      await supabase.rpc('create_projects_table_if_not_exists').catch(() => {
        console.log('RPC not available or projects table already exists');
      });
    } catch (error) {
      console.error('Error ensuring projects table exists:', error);
    }
  }
}

// Create an instance of the service for easy imports
export const projectService = new ProjectService();
