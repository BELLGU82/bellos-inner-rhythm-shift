import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  InputAdornment,
  Tooltip,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Collapse
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  CalendarToday as CalendarTodayIcon,
  MoreVert as MoreVertIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { formatDistanceToNow } from 'date-fns';
import he from 'date-fns/locale/he';
import { v4 as uuidv4 } from 'uuid';
import { ProjectService } from '../../services/ProjectService';
import { Project, ProjectStatus, ProjectPriority } from '../../types/Project';

// Project List Component
const ProjectList: React.FC = () => {
  // State for projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for project form
  const [openForm, setOpenForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for sorting
  const [sortField, setSortField] = useState<keyof Project>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Form validation
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    description?: string;
    dueDate?: string;
  }>({});

  // Deletion confirmation
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('success');

  // Load projects
  useEffect(() => {
    loadProjects();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [projects, searchTerm, statusFilter, priorityFilter, sortField, sortDirection]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await ProjectService.getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please try again later.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (project?: Project) => {
    if (project) {
      setCurrentProject(project);
      setIsEditMode(true);
    } else {
      setCurrentProject({
        id: uuidv4(),
        title: '',
        description: '',
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 1 week
        completedAt: null,
        progress: 0,
        tags: [],
        milestones: []
      });
      setIsEditMode(false);
    }
    setFormErrors({});
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentProject(null);
  };

  const validateForm = (): boolean => {
    const errors: {
      title?: string;
      description?: string;
      dueDate?: string;
    } = {};

    if (!currentProject?.title.trim()) {
      errors.title = 'שם הפרויקט הינו שדה חובה';
    }

    if (!currentProject?.description.trim()) {
      errors.description = 'תיאור הפרויקט הינו שדה חובה';
    }

    if (!currentProject?.dueDate) {
      errors.dueDate = 'תאריך יעד הינו שדה חובה';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProject = async () => {
    if (!currentProject || !validateForm()) return;

    setLoading(true);
    try {
      const updatedProject = {
        ...currentProject,
        updatedAt: new Date().toISOString()
      };

      if (isEditMode) {
        await ProjectService.updateProject(updatedProject);
        setProjects(prevProjects =>
          prevProjects.map(p => (p.id === updatedProject.id ? updatedProject : p))
        );
        showAlert('הפרויקט עודכן בהצלחה', 'success');
      } else {
        await ProjectService.addProject(updatedProject);
        setProjects(prevProjects => [...prevProjects, updatedProject]);
        showAlert('הפרויקט נוסף בהצלחה', 'success');
      }
      
      handleCloseForm();
    } catch (err) {
      console.error('Error saving project:', err);
      showAlert('שגיאה בשמירת הפרויקט', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setLoading(true);
    try {
      await ProjectService.deleteProject(projectToDelete);
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete));
      showAlert('הפרויקט נמחק בהצלחה', 'success');
    } catch (err) {
      console.error('Error deleting project:', err);
      showAlert('שגיאה במחיקת הפרויקט', 'error');
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
      setProjectToDelete(null);
    }
  };

  const handleUpdateStatus = async (projectId: string, newStatus: ProjectStatus) => {
    setLoading(true);
    try {
      const projectToUpdate = projects.find(p => p.id === projectId);
      if (!projectToUpdate) return;

      const updatedProject = {
        ...projectToUpdate,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null,
        progress: newStatus === 'COMPLETED' ? 100 : projectToUpdate.progress
      };

      await ProjectService.updateProject(updatedProject);
      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === projectId ? updatedProject : p))
      );
      showAlert('סטטוס הפרויקט עודכן בהצלחה', 'success');
    } catch (err) {
      console.error('Error updating project status:', err);
      showAlert('שגיאה בעדכון סטטוס הפרויקט', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (projectId: string, progress: number) => {
    setLoading(true);
    try {
      const projectToUpdate = projects.find(p => p.id === projectId);
      if (!projectToUpdate) return;

      const newStatus = progress === 100 ? 'COMPLETED' : 
                        progress > 0 ? 'IN_PROGRESS' : 
                        'NOT_STARTED';

      const updatedProject = {
        ...projectToUpdate,
        progress,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null
      };

      await ProjectService.updateProject(updatedProject);
      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === projectId ? updatedProject : p))
      );
      showAlert('התקדמות הפרויקט עודכנה בהצלחה', 'success');
    } catch (err) {
      console.error('Error updating project progress:', err);
      showAlert('שגיאה בעדכון התקדמות הפרויקט', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...projects];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        project =>
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(project => project.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'ALL') {
      result = result.filter(project => project.priority === priorityFilter);
    }

    // Apply sorting
    result = result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredProjects(result);
  };

  const handleSort = (field: keyof Project) => {
    setSortDirection(prev => (sortField === field && prev === 'asc' ? 'desc' : 'asc'));
    setSortField(field);
  };

  const handleOpenDeleteDialog = (projectId: string) => {
    setProjectToDelete(projectId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setProjectToDelete(null);
  };

  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
    setTimeout(() => setAlertOpen(false), 5000);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'NOT_STARTED': return '#9e9e9e';
      case 'IN_PROGRESS': return '#2196f3';
      case 'ON_HOLD': return '#ff9800';
      case 'COMPLETED': return '#4caf50';
      case 'CANCELLED': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case 'LOW': return '#8bc34a';
      case 'MEDIUM': return '#ff9800';
      case 'HIGH': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case 'NOT_STARTED': return 'טרם התחיל';
      case 'IN_PROGRESS': return 'בתהליך';
      case 'ON_HOLD': return 'בהמתנה';
      case 'COMPLETED': return 'הושלם';
      case 'CANCELLED': return 'בוטל';
      default: return status;
    }
  };

  const getPriorityText = (priority: ProjectPriority) => {
    switch (priority) {
      case 'LOW': return 'נמוכה';
      case 'MEDIUM': return 'בינונית';
      case 'HIGH': return 'גבוהה';
      default: return priority;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('he-IL');
    } catch (error) {
      return 'תאריך לא תקין';
    }
  };

  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Compute project stats
  const projectStats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'COMPLETED').length;
    const inProgress = projects.filter(p => p.status === 'IN_PROGRESS').length;
    const notStarted = projects.filter(p => p.status === 'NOT_STARTED').length;
    const onHold = projects.filter(p => p.status === 'ON_HOLD').length;
    const cancelled = projects.filter(p => p.status === 'CANCELLED').length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      inProgress,
      notStarted,
      onHold,
      cancelled,
      completionRate
    };
  }, [projects]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
      <Box sx={{ p: 3, width: '100%' }}>
        {/* Alert for notifications */}
        <Collapse in={alertOpen}>
          <Alert 
            severity={alertType}
            sx={{ mb: 2 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setAlertOpen(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {alertMessage}
          </Alert>
        </Collapse>

        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            ניהול פרויקטים
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            disabled={loading}
          >
            פרויקט חדש
          </Button>
        </Box>

        {/* Project Statistics */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            סטטיסטיקות פרויקטים
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">סה"כ פרויקטים</Typography>
                <Typography variant="h5">{projectStats.total}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">הושלמו</Typography>
                <Typography variant="h5" sx={{ color: 'success.main' }}>
                  {projectStats.completed}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">בתהליך</Typography>
                <Typography variant="h5" sx={{ color: 'info.main' }}>
                  {projectStats.inProgress}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">טרם התחילו</Typography>
                <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                  {projectStats.notStarted}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">בהמתנה</Typography>
                <Typography variant="h5" sx={{ color: 'warning.main' }}>
                  {projectStats.onHold}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">אחוז השלמה</Typography>
                <Typography variant="h5" sx={{ color: 'primary.main' }}>
                  {projectStats.completionRate}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                label="חיפוש פרויקטים"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mr: 2, width: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ mr: 2 }}
              >
                סינון
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadProjects}
                disabled={loading}
              >
                רענון
              </Button>
            </Box>
            <Box>
              <Button
                variant="text"
                color="primary"
                size="small"
                endIcon={sortDirection === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                onClick={() => handleSort('dueDate')}
              >
                תאריך יעד
              </Button>
              <Button
                variant="text"
                color="primary"
                size="small"
                endIcon={sortDirection === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                onClick={() => handleSort('priority')}
              >
                עדיפות
              </Button>
              <Button
                variant="text"
                color="primary"
                size="small"
                endIcon={sortDirection === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                onClick={() => handleSort('status')}
              >
                סטטוס
              </Button>
            </Box>
          </Box>

          <Collapse in={showFilters}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>סטטוס</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'ALL')}
                    label="סטטוס"
                  >
                    <MenuItem value="ALL">כל הסטטוסים</MenuItem>
                    <MenuItem value="NOT_STARTED">טרם התחיל</MenuItem>
                    <MenuItem value="IN_PROGRESS">בתהליך</MenuItem>
                    <MenuItem value="ON_HOLD">בהמתנה</MenuItem>
                    <MenuItem value="COMPLETED">הושלם</MenuItem>
                    <MenuItem value="CANCELLED">בוטל</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>עדיפות</InputLabel>
                  <Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as ProjectPriority | 'ALL')}
                    label="עדיפות"
                  >
                    <MenuItem value="ALL">כל העדיפויות</MenuItem>
                    <MenuItem value="LOW">נמוכה</MenuItem>
                    <MenuItem value="MEDIUM">בינונית</MenuItem>
                    <MenuItem value="HIGH">גבוהה</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>
        </Paper>

        {/* Loading and Error States */}
        {loading && (
          <Box sx={{ width: '100%', my: 3, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Project List */}
        {!loading && !error && (
          <>
            {filteredProjects.length === 0 ? (
              <Box sx={{ textAlign: 'center', my: 5 }}>
                <Typography variant="h6" color="textSecondary">
                  לא נמצאו פרויקטים
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  נסו להוסיף פרויקט חדש או לשנות את סינון החיפוש
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
                        position: 'relative',
                        border: '1px solid',
                        borderColor: getStatusColor(project.status),
                        borderTop: `4px solid ${getStatusColor(project.status)}`
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" component="div" noWrap>
                            {project.title}
                          </Typography>
                          <Chip 
                            size="small"
                            label={getPriorityText(project.priority)}
                            sx={{ 
                              bgcolor: getPriorityColor(project.priority),
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                        
                        <Chip 
                          size="small"
                          label={getStatusText(project.status)}
                          sx={{ 
                            bgcolor: getStatusColor(project.status),
                            color: 'white',
                            mb: 2
                          }}
                        />
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            height: '4.5em',
                          }}
                        >
                          {project.description}
                        </Typography>
                        
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            התקדמות: {project.progress}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={project.progress} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              my: 1,
                              bgcolor: 'rgba(0,0,0,0.1)'
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              יעד: {formatDate(project.dueDate)}
                            </Typography>
                          </Box>
                          
                          {project.status !== 'COMPLETED' && project.status !== 'CANCELLED' && (
                            <Tooltip title="ימים שנותרו ליעד">
                              <Chip
                                size="small"
                                label={`${calculateDaysLeft(project.dueDate)} ימים`}
                                color={calculateDaysLeft(project.dueDate) < 0 ? 'error' : 
                                      calculateDaysLeft(project.dueDate) < 3 ? 'warning' : 'default'}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                        
                        {project.tags && project.tags.length > 0 && (
                          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {project.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                size="small"
                                label={tag}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        )}
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleOpenForm(project)}
                          startIcon={<EditIcon />}
                        >
                          עריכה
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(project.id)}
                          startIcon={<DeleteIcon />}
                        >
                          מחיקה
                        </Button>
                        {project.status !== 'COMPLETED' && (
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleUpdateStatus(project.id, 'COMPLETED')}
                            startIcon={<CheckIcon />}
                          >
                            סיום
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* Project Form Dialog */}
        <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
          <DialogTitle>
            {isEditMode ? 'עריכת פרויקט' : 'הוספת פרויקט חדש'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="שם הפרויקט"
                  fullWidth
                  value={currentProject?.title || ''}
                  onChange={(e) => setCurrentProject(prev => 
                    prev ? { ...prev, title: e.target.value } : null
                  )}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="תיאור הפרויקט"
                  fullWidth
                  multiline
                  rows={4}
                  value={currentProject?.description || ''}
                  onChange={(e) => setCurrentProject(prev => 
                    prev ? { ...prev, description: e.target.value } : null
                  )}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>סטטוס</InputLabel>
                  <Select
                    value={currentProject?.status || 'NOT_STARTED'}
                    onChange={(e) => setCurrentProject(prev => 
                      prev ? { 
                        ...prev, 
                        status: e.target.value as ProjectStatus,
                        completedAt: e.target.value === 'COMPLETED' ? new Date().toISOString() : null,
                        progress: e.target.value === 'COMPLETED' ? 100 : prev.progress
                      } : null
                    )}
                    label="סטטוס"
                  >
                    <MenuItem value="NOT_STARTED">טרם התחיל</MenuItem>
                    <MenuItem value="IN_PROGRESS">בתהליך</MenuItem>
                    <MenuItem value="ON_HOLD">בהמתנה</MenuItem>
                    <MenuItem value="COMPLETED">הושלם</MenuItem>
                    <MenuItem value="CANCELLED">בוטל</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>עדיפות</InputLabel>
                  <Select
                    value={currentProject?.priority || 'MEDIUM'}
                    onChange={(e) => setCurrentProject(prev => 
                      prev ? { ...prev, priority: e.target.value as ProjectPriority } : null
                    )}
                    label="עדיפות"
                  >
                    <MenuItem value="LOW">נמוכה</MenuItem>
                    <MenuItem value="MEDIUM">בינונית</MenuItem>
                    <MenuItem value="HIGH">גבוהה</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="תאריך יעד"
                  value={currentProject?.dueDate ? new Date(currentProject.dueDate) : null}
                  onChange={(date) => setCurrentProject(prev => 
                    prev ? { ...prev, dueDate: date ? date.toISOString() : prev.dueDate } : null
                  )}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.dueDate,
                      helperText: formErrors.dueDate
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="אחוז התקדמות"
                  type="number"
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  value={currentProject?.progress || 0}
                  onChange={(e) => {
                    const value = Math.min(100, Math.max(0, Number(e.target.value)));
                    setCurrentProject(prev => 
                      prev ? { ...prev, progress: value } : null
                    );
                  }}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="תגיות (מופרדות בפסיק)"
                  fullWidth
                  value={currentProject?.tags?.join(', ') || ''}
                  onChange={(e) => setCurrentProject(prev => 
                    prev ? { 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    } : null
                  )}
                  placeholder="הוסף תגיות מופרדות בפסיק: לדוגמה - משימה, פיתוח, דחוף"
                  helperText="הוסף תגיות כדי לסווג את הפרויקט"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm} color="inherit">
              ביטול
            </Button>
            <Button 
              onClick={handleSaveProject} 
              color="primary" 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : isEditMode ? 'עדכון' : 'שמירה'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>מחיקת פרויקט</DialogTitle>
          <DialogContent>
            <Typography>
              האם אתה בטוח שברצונך למחוק את הפרויקט? פעולה זו אינה ניתנת לביטול.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="inherit">
              ביטול
            </Button>
            <Button 
              onClick={handleDeleteProject} 
              color="error" 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'מחיקה'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ProjectList;