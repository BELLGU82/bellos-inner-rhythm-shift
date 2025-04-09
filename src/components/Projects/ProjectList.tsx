import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Badge,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  SortByAlpha as SortIcon,
  Assignment as AssignmentIcon,
  Flag as FlagIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  MoreVert as MoreVertIcon,
  DateRange as DateRangeIcon,
  Folder as FolderIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
} from '@mui/icons-material';
import ProjectService, { Project, ProjectStatus } from '../../services/ProjectService';
import { formatDate } from '../../utils/dateUtils';
import EmptyState from '../common/EmptyState';
import { useTheme } from '@mui/material/styles';

interface ProjectFormData {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: ProjectStatus;
  priority: 'low' | 'medium' | 'high';
  milestones: { title: string; completed: boolean }[];
}

interface ProjectListProps {
  onProjectSelect?: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onProjectSelect }) => {
  const theme = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<ProjectFormData>({
    title: '',
    description: '',
    dueDate: '',
    status: 'not_started',
    priority: 'medium',
    milestones: [],
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [milestoneTitle, setMilestoneTitle] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const projectsData = await ProjectService.getAllProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load projects:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load projects. Please try again.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((project) => project.status === filterStatus);
    }

    // Tab filter (0: Active, 1: Completed)
    result = result.filter((project) => 
      currentTab === 0 ? project.status !== 'completed' : project.status === 'completed'
    );

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - 
                 priorityOrder[b.priority as keyof typeof priorityOrder];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'dueDate':
        default:
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

    return result;
  }, [projects, searchTerm, filterStatus, sortBy, currentTab]);

  // Create a new project
  const handleCreateProject = async () => {
    try {
      const newProject: Omit<Project, 'id' | 'createdAt'> = {
        title: currentProject.title,
        description: currentProject.description,
        dueDate: currentProject.dueDate,
        status: currentProject.status,
        priority: currentProject.priority,
        progress: 0,
        milestones: currentProject.milestones,
      };

      const created = await ProjectService.createProject(newProject);
      setProjects([...projects, created]);
      setSnackbar({
        open: true,
        message: 'Project created successfully!',
        severity: 'success',
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to create project:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create project. Please try again.',
        severity: 'error',
      });
    }
  };

  // Update an existing project
  const handleUpdateProject = async () => {
    if (!currentProject.id) return;
    
    try {
      const updatedProject: Project = {
        id: currentProject.id,
        title: currentProject.title,
        description: currentProject.description,
        dueDate: currentProject.dueDate,
        status: currentProject.status,
        priority: currentProject.priority,
        progress: projects.find(p => p.id === currentProject.id)?.progress || 0,
        milestones: currentProject.milestones,
        createdAt: projects.find(p => p.id === currentProject.id)?.createdAt || new Date().toISOString(),
      };

      await ProjectService.updateProject(updatedProject);
      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      setSnackbar({
        open: true,
        message: 'Project updated successfully!',
        severity: 'success',
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to update project:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update project. Please try again.',
        severity: 'error',
      });
    }
  };

  // Delete a project
  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await ProjectService.deleteProject(id);
        setProjects(projects.filter(p => p.id !== id));
        setSnackbar({
          open: true,
          message: 'Project deleted successfully!',
          severity: 'success',
        });
      } catch (error) {
        console.error('Failed to delete project:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete project. Please try again.',
          severity: 'error',
        });
      }
    }
  };

  // Update project progress
  const handleUpdateProgress = async (project: Project, progress: number) => {
    try {
      await ProjectService.updateProgress(project.id, progress);
      setProjects(
        projects.map(p => 
          p.id === project.id ? { ...p, progress } : p
        )
      );
    } catch (error) {
      console.error('Failed to update progress:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update progress. Please try again.',
        severity: 'error',
      });
    }
  };

  // Complete a project
  const handleCompleteProject = async (id: string) => {
    try {
      await ProjectService.completeProject(id);
      setProjects(
        projects.map(p => 
          p.id === id ? { ...p, status: 'completed', progress: 100 } : p
        )
      );
      setSnackbar({
        open: true,
        message: 'Project marked as completed!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to complete project:', error);
      setSnackbar({
        open: true,
        message: 'Failed to complete project. Please try again.',
        severity: 'error',
      });
    }
  };

  // Add a milestone to current project
  const handleAddMilestone = () => {
    if (!milestoneTitle.trim()) return;
    
    setCurrentProject({
      ...currentProject,
      milestones: [
        ...currentProject.milestones,
        { title: milestoneTitle, completed: false }
      ]
    });
    setMilestoneTitle('');
  };

  // Remove a milestone from current project
  const handleRemoveMilestone = (index: number) => {
    setCurrentProject({
      ...currentProject,
      milestones: currentProject.milestones.filter((_, i) => i !== index)
    });
  };

  // Toggle milestone completion
  const handleToggleMilestone = async (projectId: string, milestoneIndex: number) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      const updatedMilestones = [...project.milestones];
      updatedMilestones[milestoneIndex].completed = !updatedMilestones[milestoneIndex].completed;
      
      await ProjectService.updateProject({
        ...project,
        milestones: updatedMilestones
      });
      
      // Update local state
      setProjects(
        projects.map(p => 
          p.id === projectId ? { ...p, milestones: updatedMilestones } : p
        )
      );
      
      // Update progress based on completed milestones
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const totalCount = updatedMilestones.length;
      const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      handleUpdateProgress({ ...project, milestones: updatedMilestones }, progress);
    } catch (error) {
      console.error('Failed to toggle milestone:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update milestone. Please try again.',
        severity: 'error',
      });
    }
  };

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setCurrentProject({
      title: '',
      description: '',
      dueDate: '',
      status: 'not_started',
      priority: 'medium',
      milestones: [],
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (project: Project) => {
    setCurrentProject({
      id: project.id,
      title: project.title,
      description: project.description,
      dueDate: project.dueDate,
      status: project.status,
      priority: project.priority,
      milestones: [...project.milestones],
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProject({
      title: '',
      description: '',
      dueDate: '',
      status: 'not_started',
      priority: 'medium',
      milestones: [],
    });
    setMilestoneTitle('');
  };

  // Handlers for form inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setCurrentProject({
      ...currentProject,
      [name as string]: value,
    });
  };

  // Get status color
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'not_started':
        return theme.palette.info.main;
      case 'in_progress':
        return theme.palette.warning.main;
      case 'on_hold':
        return theme.palette.error.light;
      case 'completed':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  // Handler for tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate due dates and styling
  const getDueStatus = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { color: 'error.main', text: 'Overdue' };
    if (diffDays === 0) return { color: 'warning.main', text: 'Today' };
    if (diffDays <= 3) return { color: 'warning.light', text: `${diffDays} days left` };
    return { color: 'success.main', text: `${diffDays} days left` };
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <FolderIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Project Management
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              New Project
            </Button>
          </Toolbar>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab 
              label={
                <Badge 
                  badgeContent={projects.filter(p => p.status !== 'completed').length} 
                  color="primary"
                >
                  Active Projects
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge 
                  badgeContent={projects.filter(p => p.status === 'completed').length} 
                  color="success"
                >
                  Completed Projects
                </Badge>
              } 
            />
          </Tabs>
        </AppBar>
      </Box>
      
      {/* Filters and Search Row */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter by Status"
                startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="not_started">Not Started</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
                {currentTab === 1 && <MenuItem value="completed">Completed</MenuItem>}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort by"
                startAdornment={<SortIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredProjects.length} projects
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Projects List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<AssignmentIcon sx={{ fontSize: 60 }} />}
          title={
            searchTerm || filterStatus !== 'all'
              ? "No projects match your filters"
              : currentTab === 0
              ? "No active projects"
              : "No completed projects"
          }
          description={
            searchTerm || filterStatus !== 'all'
              ? "Try changing your search or filter criteria"
              : currentTab === 0
              ? "Start by creating your first project"
              : "Complete some projects to see them here"
          }
          actionText={searchTerm || filterStatus !== 'all' ? "Clear filters" : "Create a project"}
          onAction={() => {
            if (searchTerm || filterStatus !== 'all') {
              setSearchTerm('');
              setFilterStatus('all');
            } else {
              handleOpenCreateDialog();
            }
          }}
        />
      ) : (
        <Grid container spacing={2}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} key={project.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 },
                  borderLeft: `4px solid ${getStatusColor(project.status)}`,
                }} 
                onClick={() => onProjectSelect && onProjectSelect(project)}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    {/* Title, Status & Due Date */}
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="flex-start">
                        <FolderIcon sx={{ mt: 0.5, mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="h6" gutterBottom component="div">
                            {project.title}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            <Chip 
                              size="small"
                              label={project.status.replace('_', ' ')}
                              sx={{
                                backgroundColor: getStatusColor(project.status),
                                color: 'white',
                                textTransform: 'capitalize'
                              }} 
                            />
                            <Chip 
                              size="small"
                              icon={<FlagIcon />} 
                              label={project.priority}
                              sx={{ 
                                backgroundColor: getPriorityColor(project.priority),
                                color: 'white',
                                textTransform: 'capitalize'
                              }}
                            />
                            <Chip 
                              size="small"
                              icon={<DateRangeIcon />}
                              label={formatDate(project.dueDate)}
                              color={project.status === 'completed' ? 'default' : getDueStatus(project.dueDate).color as any}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                    
                    {/* Progress & Milestones */}
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Progress: {project.progress}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 5,
                          mb: 1
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        <PlaylistAddCheckIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                        {project.milestones.filter(m => m.completed).length} of {project.milestones.length} milestones completed
                      </Typography>
                    </Grid>
                    
                    {/* Actions */}
                    <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Box>
                        {project.status !== 'completed' && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditDialog(project);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mark as Complete">
                              <IconButton 
                                color="success" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteProject(project.id);
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Delete">
                          <IconButton 
                            color="error" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                    
                    {/* Description & Milestones */}
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {project.description.length > 150 
                          ? `${project.description.substring(0, 150)}...` 
                          : project.description}
                      </Typography>
                      
                      {project.milestones.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            <TimelineIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                            Milestones:
                          </Typography>
                          <List dense disablePadding>
                            {project.milestones.slice(0, 3).map((milestone, index) => (
                              <ListItem 
                                key={index} 
                                disablePadding
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleMilestone(project.id, index);
                                }}
                                sx={{ 
                                  py: 0.5,
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: 'action.hover' }
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Checkbox 
                                    edge="start"
                                    checked={milestone.completed}
                                    disableRipple
                                    size="small"
                                  />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={milestone.title}
                                  primaryTypographyProps={{
                                    variant: 'body2',
                                    style: milestone.completed ? { textDecoration: 'line-through' } : undefined
                                  }}
                                />
                              </ListItem>
                            ))}
                            {project.milestones.length > 3 && (
                              <ListItem>
                                <ListItemText 
                                  primary={`+ ${project.milestones.length - 3} more milestones`} 
                                  primaryTypographyProps={{
                                    variant: 'body2',
                                    color: 'text.secondary'
                                  }}
                                />
                              </ListItem>
                            )}
                          </List>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Project Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentProject.id ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Project Title"
                fullWidth
                required
                value={currentProject.title}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                multiline
                rows={4}
                fullWidth
                value={currentProject.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="dueDate"
                label="Due Date"
                type="date"
                fullWidth
                required
                value={currentProject.dueDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={currentProject.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="not_started">Not Started</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="on_hold">On Hold</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={currentProject.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                <TimelineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Milestones
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Add Milestone"
                  fullWidth
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone()}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddMilestone}
                  disabled={!milestoneTitle.trim()}
                >
                  Add
                </Button>
              </Box>
              
              <List>
                {currentProject.milestones.map((milestone, index) => (
                  <ListItem 
                    key={index}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => handleRemoveMilestone(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={milestone.completed}
                        onChange={() => {
                          const updatedMilestones = [...currentProject.milestones];
                          updatedMilestones[index].completed = !updatedMilestones[index].completed;
                          setCurrentProject({ ...currentProject, milestones: updatedMilestones });
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={milestone.title} />
                  </ListItem>
                ))}
                {currentProject.milestones.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No milestones added yet. Add some milestones to track project progress.
                  </Typography>
                )}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={currentProject.id ? handleUpdateProject : handleCreateProject}
            disabled={!currentProject.title || !currentProject.dueDate}
          >
            {currentProject.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectList;