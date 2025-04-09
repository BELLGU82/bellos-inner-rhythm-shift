// src/components/Reminders/ReminderList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  SelectChangeEvent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useMediaQuery
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterListIcon,
  RestoreFromTrash as RestoreIcon,
  Flag as FlagIcon,
  LocalOffer as TagIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { Reminder, subscribeToReminders, deleteReminder, completeReminder, isOverdue, getDueText, updateReminder } from '../../services/reminderService';
import { ReminderPriorityColors } from '../../theme';

interface ReminderListProps {
  onEditReminder?: (reminder: Reminder) => void;
  onAddReminder?: () => void;
  showCompleted?: boolean;
  maxItems?: number;
  category?: string;
  searchQuery?: string;
  simpleView?: boolean;
}

const ReminderList: React.FC<ReminderListProps> = ({
  onEditReminder,
  onAddReminder,
  showCompleted = false,
  maxItems,
  category,
  searchQuery = '',
  simpleView = false
}) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Local state
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [openFilterMenu, setOpenFilterMenu] = useState<boolean>(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);
  
  // Load reminders
  useEffect(() => {
    const unsubscribe = subscribeToReminders((newReminders) => {
      setReminders(newReminders);
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedReminderId(id);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReminderId(null);
  };
  
  // Handle edit
  const handleEdit = () => {
    const reminder = reminders.find(r => r.id === selectedReminderId);
    
    if (reminder && onEditReminder) {
      onEditReminder(reminder);
    } else if (reminder) {
      // For standalone usage, navigate to edit page
      router.push(`/reminders/edit/${reminder.id}`);
    }
    
    handleMenuClose();
  };
  
  // Handle delete
  const handleDeleteClick = () => {
    const reminder = reminders.find(r => r.id === selectedReminderId);
    if (reminder) {
      setReminderToDelete(reminder);
      setConfirmDeleteOpen(true);
    }
    handleMenuClose();
  };
  
  // Confirm delete
  const handleConfirmDelete = () => {
    if (reminderToDelete) {
      deleteReminder(reminderToDelete.id);
    }
    setConfirmDeleteOpen(false);
    setReminderToDelete(null);
  };
  
  // Handle toggle completion
  const handleToggleComplete = (id: string, currentCompleted: boolean) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    
    if (currentCompleted) {
      // Uncomplete
      updateReminder({ ...reminder, completed: false, completedAt: undefined });
    } else {
      // Complete
      completeReminder(id);
    }
  };
  
  // Filter the reminders based on criteria
  const filteredReminders = useMemo(() => {
    return reminders
      .filter(reminder => {
        // Apply completed filter
        if (!showCompleted && reminder.completed) {
          return false;
        }
        
        // Apply category filter if provided
        if (category && reminder.category !== category) {
          return false;
        }
        
        // Apply priority filter
        if (filter !== 'all' && reminder.priority !== filter) {
          return false;
        }
        
        // Apply search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = reminder.title.toLowerCase().includes(query);
          const matchesDescription = reminder.description.toLowerCase().includes(query);
          const matchesCategory = reminder.category.toLowerCase().includes(query);
          const matchesTags = reminder.tags.some(tag => tag.toLowerCase().includes(query));
          
          return matchesTitle || matchesDescription || matchesCategory || matchesTags;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort based on criteria
        switch (sortBy) {
          case 'dueDate':
            // Sort by due date (null values last)
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            
          case 'priority':
            // Sort by priority (high > medium > low)
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
            
          case 'createdAt':
            // Sort by creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            
          default:
            return 0;
        }
      });
  }, [reminders, showCompleted, category, filter, searchQuery, sortBy]);
  
  // Limit the number of shown reminders if maxItems is set
  const displayedReminders = maxItems ? filteredReminders.slice(0, maxItems) : filteredReminders;
  
  // Handle filter change
  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };
  
  // Render filter menu
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
    setOpenFilterMenu(true);
  };
  
  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
    setOpenFilterMenu(false);
  };
  
  // If loading, show loading spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  // If no reminders match current filters
  if (displayedReminders.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          לא נמצאו תזכורות
        </Typography>
        {onAddReminder && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onAddReminder}
            sx={{ mt: 2 }}
          >
            צור תזכורת חדשה
          </Button>
        )}
      </Paper>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Filters area */}
      {!simpleView && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'stretch' : 'center',
            mb: 2,
            gap: 2
          }}
        >
          {/* Filter button for mobile */}
          {isMobile && (
            <Button 
              startIcon={<FilterListIcon />}
              variant="outlined"
              onClick={handleFilterMenuOpen}
              fullWidth
            >
              מסננים וסידור
            </Button>
          )}
          
          {/* Regular filters for desktop */}
          {!isMobile && (
            <>
              <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel id="priority-filter-label">עדיפות</InputLabel>
                <Select
                  labelId="priority-filter-label"
                  id="priority-filter"
                  value={filter}
                  onChange={handleFilterChange}
                  label="עדיפות"
                >
                  <MenuItem value="all">הכל</MenuItem>
                  <MenuItem value="high">גבוהה</MenuItem>
                  <MenuItem value="medium">בינונית</MenuItem>
                  <MenuItem value="low">נמוכה</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel id="sort-by-label">מיין לפי</InputLabel>
                <Select
                  labelId="sort-by-label"
                  id="sort-by"
                  value={sortBy}
                  onChange={handleSortChange}
                  label="מיין לפי"
                >
                  <MenuItem value="dueDate">תאריך יעד</MenuItem>
                  <MenuItem value="priority">עדיפות</MenuItem>
                  <MenuItem value="createdAt">תאריך יצירה</MenuItem>
                </Select>
              </FormControl>
              
              {showCompleted && (
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label="כולל הושלמו" 
                  color="success" 
                  variant="outlined" 
                  sx={{ ml: 1 }}
                />
              )}
            </>
          )}
          
          {/* Filter menu (for mobile) */}
          <Menu
            anchorEl={filterAnchorEl}
            open={openFilterMenu}
            onClose={handleFilterMenuClose}
          >
            <MenuItem>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="priority-filter-label-mobile">עדיפות</InputLabel>
                <Select
                  labelId="priority-filter-label-mobile"
                  value={filter}
                  onChange={handleFilterChange}
                  label="עדיפות"
                >
                  <MenuItem value="all">הכל</MenuItem>
                  <MenuItem value="high">גבוהה</MenuItem>
                  <MenuItem value="medium">בינונית</MenuItem>
                  <MenuItem value="low">נמוכה</MenuItem>
                </Select>
              </FormControl>
            </MenuItem>
            
            <MenuItem>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="sort-by-label-mobile">מיין לפי</InputLabel>
                <Select
                  labelId="sort-by-label-mobile"
                  value={sortBy}
                  onChange={handleSortChange}
                  label="מיין לפי"
                >
                  <MenuItem value="dueDate">תאריך יעד</MenuItem>
                  <MenuItem value="priority">עדיפות</MenuItem>
                  <MenuItem value="createdAt">תאריך יצירה</MenuItem>
                </Select>
              </FormControl>
            </MenuItem>
          </Menu>
          
          {!isMobile && onAddReminder && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onAddReminder}
            >
              הוסף תזכורת
            </Button>
          )}
        </Box>
      )}
      
      {/* Reminders list */}
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {displayedReminders.map((reminder, index) => {
          const isReminderOverdue = isOverdue(reminder);
          const dueText = getDueText(reminder);
          
          return (
            <React.Fragment key={reminder.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  opacity: reminder.completed ? 0.7 : 1,
                  bgcolor: isReminderOverdue && !reminder.completed ? 'error.soft' : 'inherit',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
                secondaryAction={
                  <Box>
                    <IconButton 
                      edge="end" 
                      aria-label="toggle-complete"
                      onClick={() => handleToggleComplete(reminder.id, reminder.completed)}
                      color={reminder.completed ? 'success' : 'default'}
                    >
                      {reminder.completed 
                        ? <CheckCircleIcon /> 
                        : <CheckCircleOutlineIcon />}
                    </IconButton>
                    
                    {!simpleView && (
                      <IconButton 
                        edge="end" 
                        aria-label="more" 
                        onClick={(e) => handleMenuOpen(e, reminder.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  {/* Priority indicator */}
                  <Tooltip title={`עדיפות ${reminder.priority === 'high' ? 'גבוהה' : reminder.priority === 'medium' ? 'בינונית' : 'נמוכה'}`}>
                    <FlagIcon 
                      sx={{ 
                        mr: 1, 
                        color: ReminderPriorityColors[reminder.priority],
                        opacity: reminder.completed ? 0.5 : 1
                      }} 
                    />
                  </Tooltip>
                  
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{
                          fontWeight: isReminderOverdue && !reminder.completed ? 'bold' : 'normal',
                          textDecoration: reminder.completed ? 'line-through' : 'none',
                          color: reminder.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {reminder.title}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        {!simpleView && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="div"
                            sx={{ 
                              mb: 1,
                              display: '-webkit-box',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {reminder.description}
                          </Typography>
                        )}
                        
                        <Box 
                          display="flex" 
                          flexDirection={isMobile ? 'column' : 'row'}
                          alignItems={isMobile ? 'flex-start' : 'center'}
                          gap={1}
                          mt={1}
                        >
                          {/* Category */}
                          <Chip 
                            label={reminder.category} 
                            size="small" 
                            variant="outlined"
                          />
                          
                          {/* Due date indicator */}
                          {reminder.dueDate && (
                            <Chip
                              icon={<ScheduleIcon />}
                              label={dueText}
                              size="small"
                              color={isReminderOverdue && !reminder.completed ? 'error' : 'default'}
                              variant={isReminderOverdue && !reminder.completed ? 'filled' : 'outlined'}
                            />
                          )}
                          
                          {/* Recurring indicator */}
                          {reminder.recurring && (
                            <Chip
                              icon={<RefreshIcon />}
                              label={`חוזר: ${
                                reminder.recurringPattern === 'daily' ? 'יומי' :
                                reminder.recurringPattern === 'weekly' ? 'שבועי' :
                                reminder.recurringPattern === 'biweekly' ? 'דו-שבועי' :
                                reminder.recurringPattern === 'monthly' ? 'חודשי' : 'שנתי'
                              }`}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          )}
                          
                          {/* Tags (only show first in simple view) */}
                          {reminder.tags.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: isMobile ? 1 : 0 }}>
                              {(simpleView ? reminder.tags.slice(0, 1) : reminder.tags).map((tag) => (
                                <Chip
                                  key={tag}
                                  icon={<TagIcon fontSize="small" />}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                              {simpleView && reminder.tags.length > 1 && (
                                <Chip
                                  label={`+${reminder.tags.length - 1}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      </React.Fragment>
                    }
                  />
                </Box>
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
      
      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          ערוך
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          מחק
        </MenuItem>
      </Menu>
      
      {/* Confirm delete dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>מחיקת תזכורת</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את התזכורת "{reminderToDelete?.title}"?
            פעולה זו לא ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>בטל</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Mobile add button at bottom */}
      {isMobile && onAddReminder && (
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            zIndex: 1000 
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={onAddReminder}
            sx={{ 
              borderRadius: '50%',
              minWidth: '56px',
              width: '56px',
              height: '56px',
              p: 0,
              boxShadow: 3
            }}
          >
            +
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ReminderList;