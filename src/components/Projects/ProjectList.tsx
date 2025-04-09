import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  IconButton,
  LinearProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Button,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  CheckCircle as CompleteIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { Project } from '../../types/Project';
import ProjectService from '../../services/ProjectService';
import ProjectForm from './ProjectForm';
import MilestoneList from './MilestoneList';
import { formatDate } from '../../utils/dateUtils';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [openProjectForm, setOpenProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [dialogTitle, setDialogTitle] = useState('');
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [projectToComplete, setProjectToComplete] = useState<Project | null>(null);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuProject, setMenuProject] = useState<Project | null>(null);
  
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Fetch projects from service
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const fetchedProjects = await ProjectService.getProjects();
        setProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects);
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('אירעה שגיאה בטעינת הפרויקטים. נסה שוב מאוחר יותר.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects when search term or status filter changes
  useEffect(() => {
    const filtered = projects.filter((project) => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === '' || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredProjects(filtered);
  }, [searchTerm, statusFilter, projects]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string);
  };

  const handleAddProject = () => {
    setSelectedProject(undefined);
    setDialogTitle('יצירת פרויקט חדש');
    setOpenProjectForm(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setDialogTitle('עריכת פרויקט');
    setOpenProjectForm(true);
    handleMenuClose();
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleCompleteClick = (project: Project) => {
    setProjectToComplete(project);
    setCompleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleProjectFormSubmit = async (projectData: any) => {
    try {
      if (selectedProject) {
        // Update existing project
        await ProjectService.updateProject({
          id: selectedProject.id,
          ...projectData
        });
        
        // Update local state
        setProjects(prevProjects => 
          prevProjects.map(p => 
            p.id === selectedProject.id 
              ? { ...p, ...projectData }
              : p
          )
        );
      } else {
        // Create new project
        const newProject = await ProjectService.createProject(projectData);
        
        // Update local state
        setProjects(prevProjects => [...prevProjects, newProject]);
      }
      
      setOpenProjectForm(false);
    } catch (err) {
      console.error('Error saving project:', err);
      setError('אירעה שגיאה בשמירת הפרויקט. נסה שוב מאוחר יותר.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      await ProjectService.deleteProject(projectToDelete.id);
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.filter(p => p.id !== projectToDelete.id)
      );
      
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('אירעה שגיאה במחיקת הפרויקט. נסה שוב מאוחר יותר.');
    }
  };

  const handleCompleteConfirm = async () => {
    if (!projectToComplete) return;
    
    try {
      await ProjectService.completeProject(projectToComplete.id);
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === projectToComplete.id 
            ? { ...p, status: 'הושלם', progress: 100 }
            : p
        )
      );
      
      setCompleteConfirmOpen(false);
      setProjectToComplete(null);
    } catch (err) {
      console.error('Error completing project:', err);
      setError('אירעה שגיאה בסימון הפרויקט כהושלם. נסה שוב מאוחר יותר.');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget);
    setMenuProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuProject(null);
  };

  const handleExpandProject = (projectId: string) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  // Function to get status chip color
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
          טוען פרויקטים...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          נסה שוב
        </Button>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
      >
        <Typography variant="h5" component="h1">
          ניהול פרויקטים
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddProject}
        >
          פרויקט חדש
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="חיפוש פרויקטים"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">סינון לפי סטטוס</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="סינון לפי סטטוס"
                endAdornment={
                  <InputAdornment position="end">
                    <FilterIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">הכל</MenuItem>
                <MenuItem value="לא התחיל">לא התחיל</MenuItem>
                <MenuItem value="בתהליך">בתהליך</MenuItem>
                <MenuItem value="מושהה">מושהה</MenuItem>
                <MenuItem value="הושלם">הושלם</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {filteredProjects.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            לא נמצאו פרויקטים
          </Typography>
          {projects.length > 0 && (
            <Typography variant="body1" color="textSecondary">
              נסה לשנות את פרמטרי החיפוש
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} key={project.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        paragraph
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: expandedProjectId === project.id ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {project.description}
                      </Typography>
                      {project.description.length > 150 && (
                        <Button 
                          size="small" 
                          onClick={() => handleExpandProject(project.id)}
                        >
                          {expandedProjectId === project.id ? 'הצג פחות' : 'הצג יותר'}
                        </Button>
                      )}
                    </Box>
                    <Box>
                      <IconButton 
                        aria-label="אפשרויות נוספות"
                        onClick={(e) => handleMenuClick(e, project)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 80 }}>
                          סטטוס:
                        </Typography>
                        <Chip 
                          label={project.status} 
                          color={getStatusColor(project.status) as any}
                          size="small"
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 80 }}>
                          תאריך יעד:
                        </Typography>
                        <Typography variant="body2">
                          {project.dueDate ? formatDate(project.dueDate) : 'לא נקבע'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" mt={1}>
                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 80 }}>
                          התקדמות:
                        </Typography>
                        <Box sx={{ width: '100%' }}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="textSecondary">
                              {project.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={project.progress} 
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {project.milestones && project.milestones.length > 0 && (
                    <Box mt={3}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        אבני דרך:
                      </Typography>
                      <MilestoneList 
                        projectId={project.id}
                        milestones={project.milestones}
                        onUpdate={() => {
                          // Refresh projects after milestone update
                          ProjectService.getProjects().then(setProjects);
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleEditProject(project)}
                  >
                    עריכה
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(project)}
                  >
                    מחיקה
                  </Button>
                  {project.status !== 'הושלם' && (
                    <Button 
                      size="small" 
                      color="success" 
                      startIcon={<CompleteIcon />}
                      onClick={() => handleCompleteClick(project)}
                    >
                      סמן כהושלם
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Project Form Dialog */}
      <ProjectForm
        open={openProjectForm}
        onClose={() => setOpenProjectForm(false)}
        onSubmit={handleProjectFormSubmit}
        initialValues={selectedProject}
        title={dialogTitle}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את הפרויקט "{projectToDelete?.name}"?
            פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            ביטול
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Confirmation Dialog */}
      <Dialog
        open={completeConfirmOpen}
        onClose={() => setCompleteConfirmOpen(false)}
      >
        <DialogTitle>אישור השלמה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך לסמן את הפרויקט "{projectToComplete?.name}" כהושלם?
            פעולה זו תעדכן את ההתקדמות ל-100% ואת הסטטוס ל"הושלם".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteConfirmOpen(false)} color="primary">
            ביטול
          </Button>
          <Button onClick={handleCompleteConfirm} color="success" autoFocus>
            סמן כהושלם
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuProject && handleEditProject(menuProject)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          עריכה
        </MenuItem>
        {menuProject && menuProject.status !== 'הושלם' && (
          <MenuItem onClick={() => menuProject && handleCompleteClick(menuProject)}>
            <CompleteIcon fontSize="small" sx={{ mr: 1 }} />
            סמן כהושלם
          </MenuItem>
        )}
        <MenuItem onClick={() => menuProject && handleDeleteClick(menuProject)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          מחיקה
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProjectList;