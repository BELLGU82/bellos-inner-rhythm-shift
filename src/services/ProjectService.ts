import { Project } from '../types/Project';
import { db } from '../firebase/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export class ProjectService {
  private projectsCollection = collection(db, 'projects');

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    try {
      const querySnapshot = await getDocs(
        query(this.projectsCollection, orderBy('createdAt', 'desc'))
      );
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          status: data.status,
          progress: data.progress,
          createdAt: data.createdAt,
          dueDate: data.dueDate,
          milestones: data.milestones || []
        } as Project;
      });
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  /**
   * Get a specific project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const projectDoc = await getDoc(doc(this.projectsCollection, id));
      
      if (!projectDoc.exists()) {
        return null;
      }
      
      const data = projectDoc.data();
      return {
        id: projectDoc.id,
        name: data.name,
        description: data.description,
        status: data.status,
        progress: data.progress,
        createdAt: data.createdAt,
        dueDate: data.dueDate,
        milestones: data.milestones || []
      } as Project;
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async createProject(project: Project): Promise<string> {
    try {
      const newProject = {
        name: project.name,
        description: project.description,
        status: project.status || 'לא התחיל',
        progress: project.progress || 0,
        createdAt: new Date().toISOString().split('T')[0],
        dueDate: project.dueDate,
        milestones: project.milestones || []
      };
      
      const docRef = await addDoc(this.projectsCollection, newProject);
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(project: Project): Promise<void> {
    try {
      if (!project.id) {
        throw new Error('Project ID is required for update');
      }
      
      const projectRef = doc(this.projectsCollection, project.id);
      await updateDoc(projectRef, {
        name: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
        dueDate: project.dueDate,
        milestones: project.milestones
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.projectsCollection, id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Complete a project (set status to completed and progress to 100%)
   */
  async completeProject(id: string): Promise<void> {
    try {
      const projectRef = doc(this.projectsCollection, id);
      await updateDoc(projectRef, {
        status: 'הושלם',
        progress: 100
      });
    } catch (error) {
      console.error('Error completing project:', error);
      throw error;
    }
  }

  /**
   * Add a milestone to a project
   */
  async addMilestone(projectId: string, milestone: any): Promise<void> {
    try {
      const projectRef = doc(this.projectsCollection, projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      const milestones = projectData.milestones || [];
      
      const newMilestone = {
        id: uuidv4(),
        title: milestone.title,
        description: milestone.description,
        completed: false,
        dueDate: milestone.dueDate,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      milestones.push(newMilestone);
      
      await updateDoc(projectRef, { milestones });
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw error;
    }
  }

  /**
   * Update a milestone
   */
  async updateMilestone(projectId: string, milestone: any): Promise<void> {
    try {
      const projectRef = doc(this.projectsCollection, projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      let milestones = projectData.milestones || [];
      
      const milestoneIndex = milestones.findIndex((m: any) => m.id === milestone.id);
      
      if (milestoneIndex === -1) {
        throw new Error('Milestone not found');
      }
      
      milestones[milestoneIndex] = {
        ...milestones[milestoneIndex],
        ...milestone
      };
      
      await updateDoc(projectRef, { milestones });
      
      // Update project progress if milestone is marked as completed
      if (milestone.completed) {
        await this.updateProjectProgress(projectId);
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  }

  /**
   * Delete a milestone
   */
  async deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
    try {
      const projectRef = doc(this.projectsCollection, projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      const milestones = projectData.milestones || [];
      
      const updatedMilestones = milestones.filter((m: any) => m.id !== milestoneId);
      
      await updateDoc(projectRef, { milestones: updatedMilestones });
      
      // Update project progress after deleting a milestone
      await this.updateProjectProgress(projectId);
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw error;
    }
  }

  /**
   * Update project progress based on completed milestones
   */
  private async updateProjectProgress(projectId: string): Promise<void> {
    try {
      const projectRef = doc(this.projectsCollection, projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      const milestones = projectData.milestones || [];
      
      if (milestones.length === 0) {
        return;
      }
      
      const completedMilestones = milestones.filter((m: any) => m.completed);
      const progress = Math.round((completedMilestones.length / milestones.length) * 100);
      
      let status = projectData.status;
      if (progress === 100) {
        status = 'הושלם';
      } else if (progress > 0) {
        status = 'בתהליך';
      }
      
      await updateDoc(projectRef, {
        progress,
        status
      });
    } catch (error) {
      console.error('Error updating project progress:', error);
      throw error;
    }
  }
}