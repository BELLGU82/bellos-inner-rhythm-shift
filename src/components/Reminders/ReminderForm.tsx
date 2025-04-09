// src/components/Reminders/ReminderForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  FormControlLabel,
  Switch,
  Stack,
  Paper,
  useTheme,
  SelectChangeEvent,
  IconButton,
  InputAdornment,
  Autocomplete,
  Tooltip,
  useMediaQuery,
  Collapse,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import heLocale from 'date-fns/locale/he';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  DeleteOutline as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  NotificationsActive as NotificationIcon,
  Category as CategoryIcon,
  Flag as FlagIcon,
  Refresh as RecurringIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { Reminder, createReminder, updateReminder, deleteReminder, getAllCategories, scheduleNotification, getAllTags } from '../../services/reminderService';
import { ReminderPriorityColors } from '../../theme';

interface ReminderFormProps {
  reminder?: Reminder;
  onSubmit?: (reminder: Reminder) => void;
  onCancel?: () => void;
  onDelete?: (id: string) => void;
}

// Default reminder object
const defaultReminder: Omit<Reminder, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  completed: false,
  dueDate: null,
  priority: 'medium',
  category: 'כללי',
  recurring: false,
  recurringPattern: 'daily',
  tags: []
};

const recurringOptions = [
  { value: 'daily', label: 'יומי' },
  { value: 'weekly', label: 'שבועי' },
  { value: 'biweekly', label: 'דו-שבועי' },
  { value: 'monthly', label: 'חודשי' },
  { value: 'yearly', label: 'שנתי' }
];

const ReminderForm: React.FC<ReminderFormProps> = ({
  reminder,
  onSubmit,
  onCancel,
  onDelete
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for the form
  const [formData, setFormData] = useState<Omit<Reminder, 'id' | 'createdAt'>>({
    ...defaultReminder
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(!isMobile);
  const [categories, setCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [notificationTime, setNotificationTime] = useState<number>(15); // minutes before due date
  
  // Load existing data if editing
  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title,
        description: reminder.description,
        completed: reminder.completed,
        dueDate: reminder.dueDate,
        priority: reminder.priority,
        category: reminder.category,
        recurring: reminder.recurring,
        recurringPattern: reminder.recurringPattern || 'daily',
        tags: [...reminder.tags],
      });
      
      // Set notification state based on reminder's notification settings
      if (reminder.notifications && reminder.notifications.length > 0) {
        setNotificationsEnabled(true);
        // Find the first notification time
        const firstNotification = reminder.notifications[0];
        // Calculate minutes before due
        if (reminder.dueDate && firstNotification.time) {
          const dueDate = new Date(reminder.dueDate);
          const notifTime = new Date(firstNotification.time);
          const diffMinutes = Math.round((dueDate.getTime() - notifTime.getTime()) / (1000 * 60));
          setNotificationTime(diffMinutes);
        }
      }
    }
  }, [reminder]);
  
  // Load categories and tags
  useEffect(() => {
    setCategories(getAllCategories());
    setAllTags(getAllTags());
  }, []);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date change
  const handleDateChange = (newDate: Date | null) => {
    setFormData(prev => ({
      ...prev,
      dueDate: newDate ? newDate.toISOString() : null
    }));
  };
  
  // Handle switch changes
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationsEnabled(e.target.checked);
  };
  
  // Handle notification time change
  const handleNotificationTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationTime(Number(e.target.value));
  };
  
  // Add a new tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (!formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
    }
    
    setNewTag('');
  };
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Add a new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    if (!categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
    }
    
    setFormData(prev => ({
      ...prev,
      category: newCategory.trim()
    }));
    
    setNewCategory('');
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'שם התזכורת הוא שדה חובה';
    }
    
    if (formData.dueDate && formData.recurring && !formData.recurringPattern) {
      newErrors.recurringPattern = 'אנא בחר תבנית חזרה';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Prepare notifications if enabled and due date is set
      let notifications = [];
      
      if (notificationsEnabled && formData.dueDate) {
        const dueDate = new Date(formData.dueDate);
        // Calculate notification time
        const notificationDate = new Date(dueDate.getTime() - notificationTime * 60 * 1000);
        
        notifications.push({
          id: reminder?.id ? `${reminder.id}-notification-1` : undefined,
          time: notificationDate.toISOString(),
          message: `תזכורת: ${formData.title}`,
          triggered: false
        });
      }
      
      // Create or update the reminder
      if (reminder) {
        // Update existing reminder
        const updatedReminder = await updateReminder({
          ...formData,
          id: reminder.id,
          createdAt: reminder.createdAt,
          completedAt: reminder.completedAt,
          notifications
        });
        
        // Schedule notifications
        if (notifications.length > 0) {
          notifications.forEach(notification => {
            scheduleNotification(notification);
          });
        }
        
        if (onSubmit) onSubmit(updatedReminder);
      } else {
        // Create new reminder
        const newReminder = await createReminder({
          ...formData,
          notifications
        });
        
        // Schedule notifications
        if (notifications.length > 0) {
          notifications.forEach(notification => {
            scheduleNotification(notification);
          });
        }
        
        if (onSubmit) onSubmit(newReminder);
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      // Handle error (could add error state and display to user)
    }
  };
  
  // Handle delete
  const handleDeleteClick = () => {
    setConfirmDeleteOpen(true);
  };
  
  // Confirm delete
  const handleConfirmDelete = async () => {
    if (reminder && reminder.id) {
      try {
        await deleteReminder(reminder.id);
        if (onDelete) onDelete(reminder.id);
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
    setConfirmDeleteOpen(false);
  };
  
  // Toggle advanced settings
  const toggleAdvanced = () => {
    setShowAdvanced(prev => !prev);
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          width: '100%', 
          mb: 4,
          borderTop: `3px solid ${reminder ? ReminderPriorityColors[formData.priority] : theme.palette.primary.main}`
        }}
      >
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ width: '100%' }}
        >
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="כותרת"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            
            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תיאור"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid>
            
            {/* Due Date and Priority - side by side on desktop */}
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="תאריך יעד"
                value={formData.dueDate ? new Date(formData.dueDate) : null}
                onChange={handleDateChange}
                sx={{ width: '100%' }}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="priority-label">עדיפות</InputLabel>
                <Select
                  labelId="priority-label"
                  name="priority"
                  value={formData.priority}
                  onChange={handleSelectChange}
                  label="עדיפות"
                  startAdornment={
                    <InputAdornment position="start">
                      <FlagIcon sx={{ color: ReminderPriorityColors[formData.priority] }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="high">גבוהה</MenuItem>
                  <MenuItem value="medium">בינונית</MenuItem>
                  <MenuItem value="low">נמוכה</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Category */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-label">קטגוריה</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  label="קטגוריה"
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <Tooltip title="הוסף קטגוריה חדשה">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddCategory();
                          }}
                          sx={{ ml: 1 }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  }
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* New Category Input - shows when adding new category */}
            {formData.category === 'add_new' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="קטגוריה חדשה"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={handleAddCategory}
                          edge="end"
                          disabled={!newCategory.trim()}
                        >
                          <CheckIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            )}
            
            {/* Tags */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                id="tags"
                options={allTags.filter(tag => !formData.tags.includes(tag))}
                value={formData.tags}
                onChange={(_, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    tags: newValue as string[]
                  }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="תגיות"
                    placeholder="הוסף תגית"
                  />
                )}
              />
            </Grid>
            
            {/* Advanced Options Button */}
            <Grid item xs={12}>
              <Button
                type="button"
                startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={toggleAdvanced}
                variant="text"
                sx={{ mb: 1 }}
              >
                {showAdvanced ? 'הסתר' : 'הצג'} הגדרות מתקדמות
              </Button>
            </Grid>
            
            {/* Advanced Options - Collapsible */}
            <Grid item xs={12}>
              <Collapse in={showAdvanced}>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    {/* Recurring Settings */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.recurring}
                            onChange={handleSwitchChange}
                            name="recurring"
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <RecurringIcon sx={{ mr: 1 }} />
                            <Typography>חזרה קבועה</Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    
                    {/* Recurring Pattern - only show if recurring is enabled */}
                    {formData.recurring && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined" error={!!errors.recurringPattern}>
                          <InputLabel id="recurringPattern-label">תבנית חזרה</InputLabel>
                          <Select
                            labelId="recurringPattern-label"
                            name="recurringPattern"
                            value={formData.recurringPattern}
                            onChange={handleSelectChange}
                            label="תבנית חזרה"
                          >
                            {recurringOptions.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.recurringPattern && (
                            <FormHelperText>{errors.recurringPattern}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    )}
                    
                    {/* Notification Settings */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationsEnabled}
                            onChange={handleNotificationToggle}
                            name="notificationsEnabled"
                            color="primary"
                            disabled={!formData.dueDate}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <NotificationIcon sx={{ mr: 1 }} />
                            <Typography>התראות</Typography>
                          </Box>
                        }
                      />
                      {!formData.dueDate && notificationsEnabled && (
                        <FormHelperText>
                          התראות זמינות רק כאשר נקבע תאריך יעד
                        </FormHelperText>
                      )}
                    </Grid>
                    
                    {/* Notification Time Settings - only show if notifications are enabled */}
                    {notificationsEnabled && formData.dueDate && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined">
                          <TextField
                            type="number"
                            label="דקות לפני מועד היעד"
                            value={notificationTime}
                            onChange={handleNotificationTimeChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <NotificationIcon />
                                </InputAdornment>
                              ),
                              inputProps: { min: 1, max: 10080 } // Max 1 week in minutes
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Collapse>
            </Grid>
            
            {/* Action Buttons */}
            <Grid item xs={12}>
              <Stack 
                direction="row" 
                spacing={2} 
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  {reminder && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeleteClick}
                    >
                      מחק
                    </Button>
                  )}
                </Box>
                
                <Stack direction="row" spacing={2}>
                  {onCancel && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={onCancel}
                    >
                      בטל
                    </Button>
                  )}
                  
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    startIcon={<SaveIcon />}
                  >
                    {reminder ? 'שמור שינויים' : 'צור תזכורת'}
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>מחיקת תזכורת</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את התזכורת "{formData.title}"?
            פעולה זו לא ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">
            בטל
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ReminderForm;