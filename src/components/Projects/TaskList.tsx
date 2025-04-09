// src/components/Projects/TaskList.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  IconButton,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  LinearProgress,
  useTheme,
  InputAdornment,
  Collapse,
  Divider
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import heLocale from 'date-fns/locale/he';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CompletedIcon,
  HourglassTop as InProgressIcon,
  Assignment as TodoIcon,
  Flag as PriorityIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { ProjectTask } from '../../types/projects';

interface TaskListProps {
  tasks: ProjectTask[];
  onTasksChange: (tasks: ProjectTask[]) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks = [], onTasksChange }) => {
  const theme = useTheme();
  
  // State
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  // Default new task
  const defaultTask: Omit<ProjectTask, 'id'> = {
    title: '',
    description: '',
    status: 'לביצוע',
    priority: 'בינונית',
    weight: 10,
  };
  
  // Form state
  const [formData, setFormData] = useState<Omit<ProjectTask, 'id'>>(defaultTask);
  
  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle number change
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let numValue = parseInt(value);
    
    // For weight, ensure it's 1-100
    if (name === 'weight') {
      if (isNaN(numValue) || numValue < 1) numValue = 1;
      if (numValue > 100) numValue = 100;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };
  
  // Handle select change
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      dueDate: date ? date.toISOString() : undefined
    }));
  };
  
  // Toggle task expansion
  const toggleTaskExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };
  
  // Add new task
  const handleAddTask = () => {
    // Validate the task
    if (!formData.title.trim()) return;
    
    const newTask: ProjectTask = {
      id: uuidv4(),
      ...formData
    };
    
    const updatedTasks = [...tasks, newTask];
    onTasksChange(updatedTasks);
    
    // Reset form
    setFormData(defaultTask);
    setShowAddTask(false);
  };
  
  // Start editing a task
  const handleStartEdit = (taskId: string) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (!taskToEdit) return;
    
    setFormData({
      title: taskToEdit.title,
      description: taskToEdit.description || '',
      status: taskToEdit.status,
      priority: taskToEdit.priority || 'בינונית',
      dueDate: taskToEdit.dueDate,
      assignedTo: taskToEdit.assignedTo || '',
      weight: taskToEdit.weight
    });
    
    setEditingTaskId(taskId);
    setShowAddTask(true);
  };
  
  // Update task
  const handleUpdateTask = () => {
    if (!editingTaskId || !formData.title.trim()) return;
    
    const updatedTasks = tasks.map(task => {
      if (task.id === editingTaskId) {
        return {
          ...task,
          ...formData
        };
      }
      return task;
    });
    
    onTasksChange(updatedTasks);
    
    // Reset form
    setFormData(defaultTask);
    setEditingTaskId(null);
    setShowAddTask(false);
  };
  
  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setConfirmDeleteId(taskId);
  };
  
  // Confirm task deletion
  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      const updatedTasks = tasks.filter(task => task.id !== confirmDeleteId);
      onTasksChange(updatedTasks);
      setConfirmDeleteId(null);
    }
  };
  
  // Toggle task status
  const handleToggleStatus = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'הושלם' ? 'לביצוע' : 'הושלם';
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'הושלם' ? new Date().toISOString() : undefined
        };
      }
      return task;
    });
    
    onTasksChange(updatedTasks);
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'הושלם':
        return { icon: <CompletedIcon />, color: theme.palette.success.main };
      case 'בתהליך':
        return { icon: <InProgressIcon />, color: theme.palette.info.main };
      case 'לביצוע':
      default:
        return { icon: <TodoIcon />, color: theme.palette.text.secondary };
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'גבוהה':
        return theme.palette.error.main;
      case 'בינונית':
        return theme.palette.warning.main;
      case 'נמוכה':
      default:
        return theme.palette.success.main;
    }
  };
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    if (tasks.length === 0) return 0;
    
    const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
    if (totalWeight === 0) return 0;
    
    const completedWeight = tasks
      .filter(task => task.status === 'הושלם')
      .reduce((sum, task) => sum + task.weight, 0);
    
    return Math.round((completedWeight / totalWeight) * 100);
  };
  
  const completionPercentage = calculateCompletion();
  
  // Render task form
  const renderTaskForm = () => {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {editingTaskId ? 'עריכת משימה' : 'משימה חדשה'}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="כותרת"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תיאור"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>סטטוס</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="סטטוס"
                >
                  <MenuItem value="לביצוע">לביצוע</MenuItem>
                  <MenuItem value="בתהליך">בתהליך</MenuItem>
                  <MenuItem value="הושלם">הושלם</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>עדיפות</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleSelectChange}
                  label="עדיפות"
                >
                  <MenuItem value="נמוכה">נמוכה</MenuItem>
                  <MenuItem value="בינונית">בינונית</MenuItem>
                  <MenuItem value="גבוהה">גבוהה</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="משקל (1-100)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleNumberChange}
                inputProps={{ min: 1, max: 100 }}
                helperText="אחוז מהפרויקט"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
                <DatePicker
                  label="תאריך יעד"
                  value={formData.dueDate ? new Date(formData.dueDate) : null}
                  onChange={handleDateChange}
                  sx={{ width: '100%' }}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="שם האחראי"
                name="assignedTo"
                value={formData.assignedTo || ''}
                onChange={handleFormChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowAddTask(false);
                    setEditingTaskId(null);
                    setFormData(defaultTask);
                  }}
                >
                  ביטול
                </Button>
                
                <Button
                  variant="contained"
                  onClick={editingTaskId ? handleUpdateTask : handleAddTask}
                  disabled={!formData.title.trim()}
                >
                  {editingTaskId ? 'עדכן משימה' : 'הוסף משימה'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Box>
      {/* Progress summary */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="body2" color="text.secondary">
              התקדמות: {completionPercentage}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={completionPercentage} 
              sx={{ height: 8, borderRadius: 5, my: 1 }}
            />
          </Grid>
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              {tasks.filter(t => t.status === 'הושלם').length} / {tasks.length} משימות הושלמו
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      {/* Task Form */}
      {showAddTask && renderTaskForm()}
      
      {/* Add Task Button */}
      {!showAddTask && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormData(defaultTask);
            setEditingTaskId(null);
            setShowAddTask(true);
          }}
          sx={{ mb: 3 }}
        >
          הוסף משימה חדשה
        </Button>
      )}
      
      {/* Tasks Table */}
      {tasks.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="5%"></TableCell>
                <TableCell>משימה</TableCell>
                <TableCell align="center" width="15%">סטטוס</TableCell>
                <TableCell align="center" width="15%">משקל</TableCell>
                <TableCell align="right" width="15%">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => {
                const statusInfo = getStatusInfo(task.status);
                
                return (
                  <React.Fragment key={task.id}>
                    <TableRow 
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        bgcolor: task.status === 'הושלם' ? 'action.selected' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleTaskExpand(task.id)}>
                          {expandedTaskId === task.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title={task.status === 'הושלם' ? 'סמן כלא הושלם' : 'סמן כהושלם'}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleToggleStatus(task.id)}
                              sx={{ mr: 1, color: statusInfo.color }}
                            >
                              {statusInfo.icon}
                            </IconButton>
                          </Tooltip>
                          <Box>
                            <Typography 
                              variant="body1"
                              sx={{
                                textDecoration: task.status === 'הושלם' ? 'line-through' : 'none',
                                color: task.status === 'הושלם' ? 'text.secondary' : 'text.primary'
                              }}
                            >
                              {task.title}
                            </Typography>
                            {task.assignedTo && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                {task.assignedTo}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={task.status} 
                          size="small"
                          sx={{ 
                            bgcolor: statusInfo.color,
                            color: 'white',
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="משקל באחוזים">
                          <Typography variant="body2">
                            {task.weight}%
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="ערוך">
                            <IconButton size="small" onClick={() => handleStartEdit(task.id)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="מחק">
                            <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Task Details */}
                    <TableRow>
                      <TableCell colSpan={5} sx={{ py: 0, borderBottom: expandedTaskId === task.id ? 1 : 'none' }}>
                        <Collapse in={expandedTaskId === task.id} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, px: 3 }}>
                            <Grid container spacing={2}>
                              {task.description && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" gutterBottom>תיאור:</Typography>
                                  <Typography variant="body2">{task.description}</Typography>
                                </Grid>
                              )}
                              
                              <Grid item xs={12} sm={4}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <PriorityIcon fontSize="small" sx={{ color: getPriorityColor(task.priority) }} />
                                  <Typography variant="body2">
                                    עדיפות: {task.priority || 'בינונית'}
                                  </Typography>
                                </Stack>
                              </Grid>
                              
                              {task.dueDate && (
                                <Grid item xs={12} sm={4}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <TimeIcon fontSize="small" />
                                    <Typography variant="body2">
                                      תאריך יעד: {formatDate(task.dueDate)}
                                    </Typography>
                                  </Stack>
                                </Grid>
                              )}
                              
                              {task.completedAt && (
                                <Grid item xs={12} sm={4}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <CompletedIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
                                    <Typography variant="body2">
                                      הושלם ב: {formatDate(task.completedAt)}
                                    </Typography>
                                  </Stack>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body1" color="text.secondary">
            אין משימות עדיין
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            לחץ על "הוסף משימה חדשה" כדי להתחיל
          </Typography>
        </Box>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
      >
        <DialogTitle>מחיקת משימה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את המשימה?
            פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>
            ביטול
          </Button>
          <Button color="error" onClick={handleConfirmDelete} autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;