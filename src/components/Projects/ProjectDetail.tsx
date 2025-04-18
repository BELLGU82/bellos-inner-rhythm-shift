
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Divider,
  Tooltip,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Add as AddIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { ProjectService } from '../../services/projectService';
import { Project, Milestone } from '../../types/Project';
import { formatDate } from '../../utils/dateUtils';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMilestoneDialogOpen, setAddMilestoneDialogOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState('');
  const [editedProject, setEditedProject] = useState<Project | null>(null);
  
  const projectService = new ProjectService();

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const projectData = await projectService.getProjectById(id);
        
        if (!projectData) {
          setError('הפרויקט לא נמצא');
          return;
        }
        
        setProject(projectData);
      } catch (err) {
        setError('שגיאה בטעינת הפרויקט');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [id]);

  const handleEditClick = () => {
    if (project) {
      setEditedProject({ ...project });
      setEditDialogOpen(true);
    }
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditDialogSave = async () => {
    if (!editedProject) return;
    
    try {
      const updatedProject = await projectService.updateProject(editedProject);
      if (updatedProject) {
        setProject(updatedProject);
      }
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    try {
      await projectService.deleteProject(id);
      setDeleteDialogOpen(false);
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleCompleteProject = async () => {
    if (!id || !project) return;
    
    try {
      const updatedProject = await projectService.completeProject(id);
      if (updatedProject) {
        setProject(updatedProject);
      }
    } catch (err) {
      console.error('Error completing project:', err);
    }
  };

  const handleMilestoneToggle = async (index: number) => {
    if (!project || !id) return;
    
    try {
      const milestones = [...project.milestones];
      const updatedMilestone = {
        ...milestones[index],
        completed: !milestones[index].completed
      };
      
      const updatedProject = await projectService.updateMilestone(
        id,
        index,
        updatedMilestone
      );
      
      if (updatedProject) {
        setProject(updatedProject);
      }
    } catch (err) {
      console.error('Error updating milestone:', err);
    }
  };

  const handleAddMilestone = async () => {
    if (!project || !id || !newMilestone.trim()) return;
    
    try {
      const updatedProject = { ...project };
      const newMilestoneObj: Milestone = {
        id: crypto.randomUUID(),
        title: newMilestone.trim(),
        completed: false,
        dueDate: new Date().toISOString()
      };
      
      updatedProject.milestones = [...(updatedProject.milestones || []), newMilestoneObj];
      
      const savedProject = await projectService.updateProject(updatedProject);
      if (savedProject) {
        setProject(savedProject);
      }
      setNewMilestone('');
      setAddMilestoneDialogOpen(false);
    } catch (err) {
      console.error('Error adding milestone:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>טוען פרויקט...</Typography>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">{error || 'הפרויקט לא נמצא'}</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          variant="contained" 
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          חזרה לרשימת הפרויקטים
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'לא התחיל': return 'info';
      case 'בתהליך': return 'warning';
      case 'הושלם': return 'success';
      default: return 'default';
    }
  };

  const projectName = project.name || project.title || '';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
        >
          חזרה לרשימה
        </Button>
        <Stack direction="row" spacing={1}>
          <Tooltip title="ערוך פרויקט">
            <IconButton onClick={handleEditClick} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="סמן כהושלם">
            <IconButton 
              onClick={handleCompleteProject} 
              color="success"
              disabled={project.status === 'הושלם'}
            >
              <CheckIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="מחק פרויקט">
            <IconButton onClick={handleDeleteClick} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4">{projectName}</Typography>
          <Chip 
            label={project.status} 
            color={getStatusColor(project.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
            icon={<FlagIcon />}
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" paragraph>
              {project.description}
            </Typography>
          </Box>
          <Box sx={{ width: {xs: '100%', md: '25%'} }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2">תאריך יעד</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {formatDate(project.dueDate)}
                </Typography>
                
                <Typography variant="subtitle2">תאריך יצירה</Typography>
                <Typography variant="body1">
                  {formatDate(project.createdAt)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>התקדמות</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={project.progress} 
              color={
                project.progress === 100 
                  ? 'success' 
                  : project.progress > 0 
                    ? 'warning' 
                    : 'primary'
              }
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {project.progress}%
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">אבני דרך</Typography>
          <Button 
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            onClick={() => setAddMilestoneDialogOpen(true)}
          >
            הוסף אבן דרך
          </Button>
        </Box>
        
        {project.milestones && project.milestones.length > 0 ? (
          <List>
            {project.milestones.map((milestone, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <Checkbox
                    edge="end"
                    checked={milestone.completed}
                    onChange={() => handleMilestoneToggle(index)}
                    disabled={project.status === 'הושלם'}
                  />
                }
                sx={{
                  textDecoration: milestone.completed ? 'line-through' : 'none',
                  opacity: milestone.completed ? 0.7 : 1
                }}
              >
                <ListItemText
                  primary={milestone.title}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            טרם הוגדרו אבני דרך לפרויקט זה
          </Typography>
        )}
      </Paper>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>עריכת פרויקט</DialogTitle>
        <DialogContent>
          {editedProject && (
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="שם הפרויקט"
                value={editedProject.name || editedProject.title || ''}
                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value, title: e.target.value })}
              />
              <TextField
                margin="normal"
                fullWidth
                multiline
                rows={4}
                label="תיאור"
                value={editedProject.description}
                onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
              />
              <TextField
                margin="normal"
                fullWidth
                label="תאריך יעד"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={editedProject.dueDate ? editedProject.dueDate.split('T')[0] : ''}
                onChange={(e) => setEditedProject({ ...editedProject, dueDate: e.target.value })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>ביטול</Button>
          <Button onClick={handleEditDialogSave} variant="contained">שמור</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת פרויקט</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם את/ה בטוח/ה שברצונך למחוק את הפרויקט? פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={addMilestoneDialogOpen} onClose={() => setAddMilestoneDialogOpen(false)}>
        <DialogTitle>הוספת אבן דרך</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם אבן הדרך"
            fullWidth
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMilestoneDialogOpen(false)}>ביטול</Button>
          <Button 
            onClick={handleAddMilestone}
            variant="contained"
            disabled={!newMilestone.trim()}
          >
            הוסף
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetail;
