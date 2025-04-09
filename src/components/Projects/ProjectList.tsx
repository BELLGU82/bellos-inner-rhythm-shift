import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  LinearProgress,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { ProjectService } from '../../services/ProjectService';
import { Project } from '../../types/Project';
import { formatDate } from '../../utils/dateUtils';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('הכל');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Create/Edit Project dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const projectService = new ProjectService();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchQuery, statusFilter, sortBy, sortDirection]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);
    } catch (err) {
      setError('שגיאה בטעינת הפרויקטים');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) || 
        project.description.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'הכל') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    // Apply sorting
    filtered = filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sortBy as keyof Project];
      let bValue: string | number | Date = b[sortBy as keyof Project];
      
      // Special handling for dates
      if (sortBy === 'dueDate' || sortBy === 'createdAt') {
        aValue = new Date(aValue as string);
        bValue = new Date(bValue as string);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredProjects(filtered);
  };

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setIsEditing(true);
      setCurrentProject(project);
    } else {
      setIsEditing(false);
      setCurrentProject({
        id: '',
        name: '',
        description: '',
        status: 'לא התחיל',
        progress: 0,
        createdAt: new Date().toISOString().split('T')[0],
        dueDate: '',
        milestones: []
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentProject(null);
  };

  const handleSaveProject = async () => {
    if (!currentProject) return;
    
    try {
      if (isEditing) {
        await projectService.updateProject(currentProject);
      } else {
        await projectService.createProject(currentProject);
      }
      
      loadProjects();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      await projectService.deleteProject(projectToDelete);
      loadProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleCompleteProject = async (projectId: string) => {
    try {
      await projectService.completeProject(projectId);
      loadProjects();
    } catch (err) {
      console.error('Error completing project:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'לא התחיל': return 'info';
      case 'בתהליך': return 'warning';
      case 'הושלם': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          onClick={loadProjects} 
          sx={{ mt: 2 }}
        >
          נסה שוב
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">ניהול פרויקטים</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          פרויקט חדש
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          label="חיפוש"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ ml: 1, color: 'text.secondary' }} />,
          }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <InputLabel id="status-filter-label">סטטוס</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="סטטוס"
            onChange={(e) => setStatusFilter(e.target.value)}
            startAdornment={<FilterListIcon sx={{ ml: 1, color: 'text.secondary' }} />}
          >
            <MenuItem value="הכל">הכל</MenuItem>
            <MenuItem value="לא התחיל">לא התחיל</MenuItem>
            <MenuItem value="בתהליך">בתהליך</MenuItem>
            <MenuItem value="הושלם">הושלם</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <InputLabel id="sort-by-label">מיון לפי</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            label="מיון לפי"
            onChange={(e) => setSortBy(e.target.value)}
            startAdornment={<SortIcon sx={{ ml: 1, color: 'text.secondary' }} />}
          >
            <MenuItem value="name">שם</MenuItem>
            <MenuItem value="dueDate">תאריך יעד</MenuItem>
            <MenuItem value="createdAt">תאריך יצירה</MenuItem>
            <MenuItem value="progress">התקדמות</MenuItem>
          </Select>
        </FormControl>
        
        <Tooltip title={sortDirection === 'asc' ? 'מיון עולה' : 'מיון יורד'}>
          <IconButton onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}>
            <SortIcon sx={{ transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {filteredProjects.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            לא נמצאו פרויקטים
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            נסה לשנות את מסנני החיפוש או הוסף פרויקט חדש
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {project.name}
                    </Typography>
                    <Chip 
                      label={project.status} 
                      size="small"
                      color={getStatusColor(project.status) as any}
                    />
                  </Box>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '4em'
                    }}
                  >
                    {project.description}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    תאריך יעד: {formatDate(project.dueDate)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      התקדמות:
                    </Typography>
                    <Box sx={{ width: '100%', mr: 1 }}>
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
                      />
                    </Box>
                    <Typography variant="body2">
                      {project.progress}%
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2 }}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    fullWidth
                  >
                    פרטים נוספים
                  </Button>
                  
                  <IconButton 
                    size="small"
                    onClick={() => handleOpenDialog(project)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  
                  <IconButton 
                    size="small"
                    onClick={() => handleCompleteProject(project.id)}
                    color="success"
                    disabled={project.status === 'הושלם'}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  
                  <IconButton 
                    size="small"
                    onClick={() => handleDeleteClick(project.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Project Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{isEditing ? 'עריכת פרויקט' : 'פרויקט חדש'}</DialogTitle>
        <DialogContent>
          {currentProject && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="שם הפרויקט"
                value={currentProject.name}
                onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="תיאור"
                value={currentProject.description}
                onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="תאריך יעד"
                    type="date"
                    value={currentProject.dueDate}
                    onChange={(e) => setCurrentProject({ ...currentProject, dueDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>סטטוס</InputLabel>
                    <Select
                      value={currentProject.status}
                      label="סטטוס"
                      onChange={(e) => setCurrentProject({ ...currentProject, status: e.target.value })}
                    >
                      <MenuItem value="לא התחיל">לא התחיל</MenuItem>
                      <MenuItem value="בתהליך">בתהליך</MenuItem>
                      <MenuItem value="הושלם">הושלם</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ביטול</Button>
          <Button 
            onClick={handleSaveProject}
            variant="contained"
            disabled={!currentProject?.name || !currentProject?.dueDate}
          >
            {isEditing ? 'עדכן' : 'צור פרויקט'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>מחיקת פרויקט</DialogTitle>
        <DialogContent>
          האם את/ה בטוח/ה שברצונך למחוק את הפרויקט? פעולה זו אינה ניתנת לביטול.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList;