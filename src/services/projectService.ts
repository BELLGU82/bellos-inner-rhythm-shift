
import { v4 as uuidv4 } from 'uuid';
import { Project, Milestone } from '../types/Project';
import { supabase } from '../integrations/supabase/client';

export class ProjectService {
  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new project
   */
  async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      milestones: []
    };

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();
      
      if (error) throw error;
      return data || newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      return newProject; // Return the local object as fallback
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(project: Project): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(project)
        .eq('id', project.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      return data;
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
}

// Create an instance of the service for easy imports
export const projectService = new ProjectService();
