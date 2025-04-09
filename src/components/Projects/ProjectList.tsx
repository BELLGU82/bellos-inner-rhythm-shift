import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Divider,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { Project, ProjectStatus } from '../../types/Project';
import { ProjectService } from '../../services/ProjectService';

const projectService = new ProjectService();

interface FilterOptions {
  status: ProjectStatus | 'all';
  searchTerm: string;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateProgressDialogOpen, setIsUpdateProgressDialogOpen] = useState(false);
  const [newProgress, setNewProgress] = useState(0);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    searchTerm: '',
  });
  const [sortOption, setSortOption] = useState<'name' | 'dueDate' | 'progress'>('dueDate');

  const [formValues, setFormValues] = useState<Omit<Project, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    status: 'לא התחיל',
    progress: 0,
    dueDate: '',
    milestones: [],
  });

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Apply filters and sorting whenever projects or filter options change
  useEffect(() => {
    applyFiltersAndSort();
  }, [projects, filterOptions, sortOption]);

  const loadProjects = async () => {
    try {
      const allProjects = await projectService.getAllProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...projects];

    // Apply status filter
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(project => project.status === filterOptions.status);
    }

    // Apply search term filter
    if (filterOptions.searchTerm) {
      const searchTerm = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter(
        project => 
          project.name.toLowerCase().includes(searchTerm) || 
          project.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortOption === 'progress') {
        return b.progress - a.progress;
      }
      return 0;
    });

    setFilteredProjects(filtered);
  };

  const handleAddProject = () => {
    setSelectedProject(null);
    setFormValues({
      name: '',
      description: '',
      status: 'לא התחיל',
      progress: 0,
      dueDate: '',
      milestones: [],
    });
    setIsDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setFormValues({
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress,
      dueDate: project.dueDate,
      milestones: project.milestones,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateProgress = (project: Project) => {
    setSelectedProject(project);
    setNewProgress(project.progress);
    setIsUpdateProgressDialogOpen(true);
  };

  const handleCompleteProject = async (id: string) => {
    try {
      await projectService.completeProject(id);
      loadProjects();
    } catch (error) {
      console.error('Error completing project:', error);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleUpdateProgressDialogClose = () => {
    setIsUpdateProgressDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name as string]: value,
    });
  };

  const handleSaveProject = async () => {
    try {
      if (selectedProject) {
        // Update existing project
        await projectService.updateProject({
          ...selectedProject,
          ...formValues,
        });
      } else {
        // Create new project
        await projectService.createProject(formValues);
      }
      setIsDialogOpen(false);
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedProject) {
      try {
        await projectService.deleteProject(selectedProject.id);
        setIsDeleteDialogOpen(false);
        loadProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleConfirmProgressUpdate = async () => {
    if (selectedProject) {
      try {
        await projectService.updateProgress(selectedProject.id, newProgress);
        setIsUpdateProgressDialogOpen(false);
        loadProjects();
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'לא התחיל':
        return 'error';
      case 'בתהליך':
        return 'warning';
      case 'הושלם':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        ניהול פרויקטים
      </Typography>

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="חיפוש פרויקטים..."
              value={filterOptions.searchTerm}
              onChange={(e) => setFilterOptions({ ...filterOptions, searchTerm: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">סטטוס</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterOptions.status}
                label="סטטוס"
                onChange={(e) => setFilterOptions({ ...filterOptions, status: e.target.value as ProjectStatus | 'all' })}
              >
                <MenuItem value="all">הכל</MenuItem>
                <MenuItem value="לא התחיל">לא התחיל</MenuItem>
                <MenuItem value="בתהליך">בתהליך</MenuItem>
                <MenuItem value="הושלם">הושלם</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="sort-label">מיון לפי</InputLabel>
              <Select
                labelId="sort-label"
                value={sortOption}
                label="מיון לפי"
                onChange={(e) => setSortOption(e.target.value as 'name' | 'dueDate' | 'progress')}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="name">שם</MenuItem>
                <MenuItem value="dueDate">תאריך יעד</MenuItem>
                <MenuItem value="progress">התקדמות</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddProject}
            >
              פרויקט חדש
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Projects List */}
      <Grid container spacing={3}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" component="h2" gutterBottom>
                      {project.name}
                    </Typography>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px' }}>
                    {project.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="body2">התקדמות: {project.progress}%</Typography>
                      <Typography variant="body2">
                        תאריך יעד: {formatDate(project.dueDate)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      color={project.progress === 100 ? "success" : "primary"}
                      sx={{ height: 8, borderRadius: 5 }}
                    />
                  </Box>
                  
                  {project.milestones && project.milestones.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>אבני דרך:</Typography>
                      {project.milestones.map((milestone, index) => (
                        <Chip
                          key={index}
                          label={milestone.name}
                          size="small"
                          color={milestone.completed ? "success" : "default"}
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Box>
                    <Tooltip title="ערוך פרויקט">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditProject(project)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחק פרויקט">
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={() => handleDeleteProject(project)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Tooltip title="עדכן התקדמות">
                      <Button 
                        size="small"
                        variant="outlined"
                        onClick={() => handleUpdateProgress(project)}
                      >
                        עדכן התקדמות
                      </Button>
                    </Tooltip>
                    {project.status !== 'הושלם' && (
                      <Tooltip title="סמן כהושלם">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleCompleteProject(project.id)}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">לא נמצאו פרויקטים</Typography>
              <Typography variant="body2" color="text.secondary">
                נסה לשנות את הסינון או להוסיף פרויקט חדש
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Project Dialog */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{selectedProject ? 'ערוך פרויקט' : 'הוסף פרויקט חדש'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="שם הפרויקט"
                value={formValues.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="תיאור"
                value={formValues.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>סטטוס</InputLabel>
                <Select
                  name="status"
                  value={formValues.status}
                  label="סטטוס"
                  onChange={handleInputChange}
                >
                  <MenuItem value="לא התחיל">לא התחיל</MenuItem>
                  <MenuItem value="בתהליך">בתהליך</MenuItem>
                  <MenuItem value="הושלם">הושלם</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="dueDate"
                label="תאריך יעד"
                type="date"
                value={formValues.dueDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="progress"
                label="התקדמות"
                type="number"
                value={formValues.progress}
                onChange={handleInputChange}
                InputProps={{ 
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 0, max: 100 }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            ביטול
          </Button>
          <Button onClick={handleSaveProject} color="primary" variant="contained">
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הפרויקט "{selectedProject?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="inherit">
            ביטול
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Progress Dialog */}
      <Dialog open={isUpdateProgressDialogOpen} onClose={handleUpdateProgressDialogClose}>
        <DialogTitle>עדכון התקדמות</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              פרויקט: {selectedProject?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              התקדמות נוכחית: {selectedProject?.progress}%
            </Typography>
            <TextField
              fullWidth
              label="התקדמות חדשה"
              type="number"
              value={newProgress}
              onChange={(e) => setNewProgress(parseInt(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                inputProps: { min: 0, max: 100 }
              }}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateProgressDialogClose} color="inherit">
            ביטול
          </Button>
          <Button onClick={handleConfirmProgressUpdate} color="primary" variant="contained">
            עדכן
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList;