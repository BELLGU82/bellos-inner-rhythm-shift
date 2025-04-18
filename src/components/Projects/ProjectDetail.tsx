
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { projectService } from '../../services/projectService';
import { Project, Milestone } from '../../types/Project';
import { formatDate } from '../../utils/dateUtils';
import ProjectForm from './ProjectForm';
import MilestoneList from './MilestoneList';
import { v4 as uuidv4 } from 'uuid';

interface ProjectDetailProps {
  projectId?: string;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId: propProjectId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const projectId = propProjectId || params.id;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [openProjectForm, setOpenProjectForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openCompleteConfirm, setOpenCompleteConfirm] = useState(false);
  const [openMilestoneForm, setOpenMilestoneForm] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  
  useEffect(() => {
    if (!projectId) {
      setError('לא סופק מזהה פרויקט');
      setLoading(false);
      return;
    }
    
    const fetchProject = async () => {
      try {
        setLoading(true);
        const fetchedProject = await projectService.getProjectById(projectId);
        
        if (fetchedProject) {
          setProject(fetchedProject);
          setError(null);
        } else {
          setError('הפרויקט לא נמצא');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('אירעה שגיאה בטעינת הפרויקט');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);
  
  const handleEditProject = () => {
    setOpenProjectForm(true);
  };
  
  const handleProjectFormSubmit = async (projectData: any) => {
    try {
      if (!project || !project.id) return;
      
      const updatedProject = await projectService.updateProject({
        ...project,
        ...projectData
      });
      
      setProject(updatedProject);
      setOpenProjectForm(false);
    } catch (err) {
      console.error('Error updating project:', err);
      setError('אירעה שגיאה בעדכון הפרויקט');
    }
  };
  
  const handleDeleteProject = async () => {
    try {
      if (!project || !project.id) return;
      
      await projectService.deleteProject(project.id);
      setOpenDeleteConfirm(false);
      
      // Navigate back to projects list
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('אירעה שגיאה במחיקת הפרויקט');
    }
  };
  
  const handleCompleteProject = async () => {
    try {
      if (!project || !project.id) return;
      
      const updatedProject = await projectService.completeProject(project.id);
      
      if (updatedProject) {
        setProject(updatedProject);
      }
      
      setOpenCompleteConfirm(false);
    } catch (err) {
      console.error('Error completing project:', err);
      setError('אירעה שגיאה בסימון הפרויקט כהושלם');
    }
  };
  
  const handleAddMilestone = () => {
    setSelectedMilestone(null);
    setOpenMilestoneForm(true);
  };
  
  const handleEditMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setOpenMilestoneForm(true);
  };
  
  const handleMilestoneFormSubmit = async (milestoneData: any) => {
    try {
      if (!project || !project.id) return;
      
      let updatedProject;
      
      if (selectedMilestone) {
        // Update existing milestone
        const milestoneIndex = project.milestones.findIndex(m => m.id === selectedMilestone.id);
        
        if (milestoneIndex !== -1) {
          const updatedMilestone = {
            ...selectedMilestone,
            title: milestoneData.title,
            description: milestoneData.description,
            dueDate: milestoneData.dueDate
          };
          
          updatedProject = await projectService.updateMilestone(
            project.id,
            milestoneIndex,
            updatedMilestone
          );
        }
      } else {
        // Create new milestone
        const newMilestone: Milestone = {
          id: uuidv4(),
          title: milestoneData.title,
          description: milestoneData.description,
          dueDate: milestoneData.dueDate,
          createdAt: new Date().toISOString()
        };
        
        const updatedMilestones = [...project.milestones, newMilestone];
        
        updatedProject = await projectService.updateProject({
          ...project,
          milestones: updatedMilestones
        });
      }
      
      if (updatedProject) {
        setProject(updatedProject);
      }
      
      setOpenMilestoneForm(false);
    } catch (err) {
      console.error('Error saving milestone:', err);
      setError('אירעה שגיאה בשמירת אבן הדרך');
    }
  };
  
  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      if (!project || !project.id) return;
      
      const updatedMilestones = project.milestones.filter(m => m.id !== milestoneId);
      
      const updatedProject = await projectService.updateProject({
        ...project,
        milestones: updatedMilestones
      });
      
      if (updatedProject) {
        setProject(updatedProject);
      }
    } catch (err) {
      console.error('Error deleting milestone:', err);
      setError('אירעה שגיאה במחיקת אבן הדרך');
    }
  };
  
  const handleCompleteMilestone = async (milestone: Milestone, completed: boolean) => {
    try {
      if (!project || !project.id) return;
      
      const milestoneIndex = project.milestones.findIndex(m => m.id === milestone.id);
      
      if (milestoneIndex !== -1) {
        const updatedMilestone = {
          ...milestone,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined
        };
        
        await projectService.updateMilestone(
          project.id,
          milestoneIndex,
          updatedMilestone
        );
        
        // Refresh the project data
        const refreshedProject = await projectService.getProjectById(project.id);
        
        if (refreshedProject) {
          setProject(refreshedProject);
        }
      }
    } catch (err) {
      console.error('Error updating milestone status:', err);
      setError('אירעה שגיאה בעדכון סטטוס אבן הדרך');
    }
  };
  
  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'לא התחיל':
        return 'default';
      case 'בתהליך':
        return 'primary';
      case 'מושהה':
        return 'warning';
      case 'הושלם':
        return 'success';
      default:
        return 'default';
    }
  };
  
  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          טוען פרויקט...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }
  
  if (error || !project) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6">
          {error || 'הפרויקט לא נמצא'}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          חזרה לרשימת הפרויקטים
        </Button>
      </Box>
    );
  }
  
  return (
    <Box p={3}>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton
          onClick={() => navigate('/projects')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {project.name}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid component="div" item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h5" gutterBottom>
                  {project.name}
                </Typography>
                <Chip 
                  label={project.status} 
                  color={getStatusColor(project.status) as any}
                  sx={{ mb: 2 }}
                />
              </Box>
              <Box>
                <Tooltip title="עריכת פרויקט">
                  <IconButton onClick={handleEditProject}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                {project.status !== 'הושלם' && (
                  <Tooltip title="סמן כהושלם">
                    <IconButton onClick={() => setOpenCompleteConfirm(true)} color="success">
                      <CompleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="מחק פרויקט">
                  <IconButton onClick={() => setOpenDeleteConfirm(true)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" paragraph>
              {project.description}
            </Typography>
            
            <Grid component="div" item xs={12} md={6}>
              <Box display="flex" alignItems="center" mt={2}>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                  תאריך יצירה:
                </Typography>
                <Typography variant="body2">
                  {formatDate(project.createdAt)}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                  תאריך יעד:
                </Typography>
                <Typography variant="body2">
                  {project.dueDate ? formatDate(project.dueDate) : 'לא נקבע'}
                </Typography>
              </Box>
            </Grid>
            
            <Box mt={3}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                התקדמות: {project.progress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={project.progress} 
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                אבני דרך
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddMilestone}
                variant="outlined"
              >
                הוסף אבן דרך
              </Button>
            </Box>
            
            <MilestoneList 
              projectId={project.id}
              milestones={project.milestones}
              onUpdate={async () => {
                // Refresh the project data
                if (project.id) {
                  const refreshedProject = await projectService.getProjectById(project.id);
                  if (refreshedProject) {
                    setProject(refreshedProject);
                  }
                }
              }}
            />
          </Paper>
        </Grid>
        
        <Grid component="div" item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              סטטיסטיקה
            </Typography>
            
            <Box mt={2}>
              <Typography variant="body2" gutterBottom>
                סך הכל אבני דרך: {project.milestones.length}
              </Typography>
              <Typography variant="body2" gutterBottom>
                אבני דרך שהושלמו: {project.milestones.filter(m => m.completed).length}
              </Typography>
              <Typography variant="body2" gutterBottom>
                אבני דרך שטרם הושלמו: {project.milestones.filter(m => !m.completed).length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Project Form Dialog */}
      {openProjectForm && (
        <ProjectForm
          open={openProjectForm}
          onClose={() => setOpenProjectForm(false)}
          onSubmit={handleProjectFormSubmit}
          initialValues={project}
          title="עריכת פרויקט"
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
      >
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את הפרויקט "{project.name}"?
            פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)}>
            ביטול
          </Button>
          <Button onClick={handleDeleteProject} color="error">
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Complete Confirmation Dialog */}
      <Dialog
        open={openCompleteConfirm}
        onClose={() => setOpenCompleteConfirm(false)}
      >
        <DialogTitle>אישור השלמה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך לסמן את הפרויקט "{project.name}" כהושלם?
            פעולה זו תעדכן את ההתקדמות ל-100% ואת הסטטוס ל"הושלם".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompleteConfirm(false)}>
            ביטול
          </Button>
          <Button onClick={handleCompleteProject} color="success">
            סמן כהושלם
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetail;
