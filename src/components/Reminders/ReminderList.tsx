// src/components/Reminders/ReminderList.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Chip, 
  IconButton, 
  Divider, 
  Paper, 
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  FlagCircle as FlagIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Reminder, getReminders, toggleReminderCompletion, deleteReminder } from '../../services/reminderService';
import ReminderForm from './ReminderForm';

interface ReminderListProps {
  onAddReminder?: () => void;
}

const ReminderList: React.FC<ReminderListProps> = ({ onAddReminder }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Load reminders
  useEffect(() => {
    loadReminders();
  }, []);

  // Extract unique categories for filter dropdown
  useEffect(() => {
    if (reminders.length > 0) {
      const categories = Array.from(new Set(reminders.map(r => r.category).filter(Boolean))) as string[];
      setAvailableCategories(categories);
    }
  }, [reminders]);

  // Apply filters and search
  useEffect(() => {
    let filtered = reminders;
    
    // Apply status filter
    if (filterOption === 'completed') {
      filtered = filtered.filter(r => r.completed);
    } else if (filterOption === 'active') {
      filtered = filtered.filter(r => !r.completed);
    } else if (filterOption === 'upcoming') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      filtered = filtered.filter(r => {
        if (!r.dueDate || r.completed) return false;
        const dueDate = new Date(r.dueDate);
        return dueDate >= today && dueDate <= nextWeek;
      });
    } else if (filterOption === 'overdue') {
      const now = new Date();
      filtered = filtered.filter(r => {
        if (!r.dueDate || r.completed) return false;
        const dueDate = new Date(r.dueDate);
        return dueDate < now;
      });
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        r => r.title.toLowerCase().includes(term) || 
             (r.description && r.description.toLowerCase().includes(term))
      );
    }
    
    // Sort by due date, with null dates last
    filtered.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    setFilteredReminders(filtered);
  }, [reminders, searchTerm, filterOption, categoryFilter]);

  const loadReminders = () => {
    const allReminders = getReminders();
    setReminders(allReminders);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilterOption(e.target.value);
  };

  const handleCategoryFilterChange = (e: SelectChangeEvent) => {
    setCategoryFilter(e.target.value);
  };

  const handleToggleComplete = (id: string) => {
    toggleReminderCompletion(id);
    loadReminders();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את התזכורת הזו?')) {
      deleteReminder(id);
      loadReminders();
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedReminder(null);
    loadReminders();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatDueDate = (date: Date | null) => {
    if (!date) return 'אין תאריך יעד';
    return format(new Date(date), 'EEEE, d בMMMM yyyy', { locale: he });
  };

  const isDueToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    const dueDate = new Date(date);
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  };

  const isOverdue = (date: Date | null, completed: boolean) => {
    if (!date || completed) return false;
    return new Date(date) < new Date();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          תזכורות וניהול משימות
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={onAddReminder}
          sx={{ height: 'fit-content' }}
        >
          תזכורת חדשה
        </Button>
      </Stack>

      {/* Search and Filter */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          <TextField
            label="חיפוש"
            variant="outlined"
            size="small"
            fullWidth
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
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="status-filter-label">סטטוס</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filterOption}
              label="סטטוס"
              onChange={handleFilterChange}
              startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">הכל</MenuItem>
              <MenuItem value="active">פעיל</MenuItem>
              <MenuItem value="completed">הושלם</MenuItem>
              <MenuItem value="upcoming">השבוע</MenuItem>
              <MenuItem value="overdue">איחור</MenuItem>
            </Select>
          </FormControl>
          
          {availableCategories.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="category-filter-label">קטגוריה</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                label="קטגוריה"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="all">כל הקטגוריות</MenuItem>
                {availableCategories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Paper>

      {/* Reminders List */}
      {filteredReminders.length > 0 ? (
        <Paper elevation={3}>
          <List>
            {filteredReminders.map((reminder, index) => (
              <React.Fragment key={reminder.id}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton edge="end" onClick={() => handleEdit(reminder)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDelete(reminder.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                  sx={{
                    bgcolor: reminder.completed ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    textDecoration: reminder.completed ? 'line-through' : 'none',
                    opacity: reminder.completed ? 0.7 : 1,
                    p: 2,
                  }}
                >
                  <IconButton 
                    onClick={() => handleToggleComplete(reminder.id)}
                    sx={{ mr: 2, color: reminder.completed ? 'success.main' : 'text.disabled' }}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={500}
                          sx={{ 
                            textDecoration: reminder.completed ? 'line-through' : 'none',
                            opacity: reminder.completed ? 0.7 : 1,
                          }}
                        >
                          {reminder.title}
                        </Typography>
                        
                        <Chip 
                          size="small" 
                          color={getPriorityColor(reminder.priority)} 
                          icon={<FlagIcon fontSize="small" />} 
                          label={reminder.priority} 
                          sx={{ ml: 1 }}
                        />
                        
                        {reminder.category && (
                          <Chip size="small" label={reminder.category} />
                        )}
                        
                        {reminder.recurring && (
                          <Chip 
                            size="small" 
                            color="info" 
                            label={reminder.recurringPattern} 
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {reminder.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mb: 1, opacity: reminder.completed ? 0.7 : 1 }}
                          >
                            {reminder.description}
                          </Typography>
                        )}
                        
                        {reminder.dueDate && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <AccessTimeIcon 
                              fontSize="small" 
                              sx={{ 
                                mr: 1, 
                                color: isOverdue(reminder.dueDate, reminder.completed) 
                                  ? 'error.main' 
                                  : isDueToday(reminder.dueDate) 
                                    ? 'warning.main' 
                                    : 'action.active'
                              }} 
                            />
                            <Typography 
                              variant="caption"
                              sx={{ 
                                color: isOverdue(reminder.dueDate, reminder.completed) 
                                  ? 'error.main' 
                                  : isDueToday(reminder.dueDate) 
                                    ? 'warning.main' 
                                    : 'text.secondary'
                              }}
                            >
                              {isDueToday(reminder.dueDate) ? 'היום' : formatDueDate(reminder.dueDate)}
                              {isOverdue(reminder.dueDate, reminder.completed) && ' (באיחור)'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {searchTerm || filterOption !== 'all' || categoryFilter !== 'all'
              ? 'לא נמצאו תזכורות התואמות לחיפוש או הפילטר שלך'
              : 'אין תזכורות עדיין. לחץ על "תזכורת חדשה" כדי להתחיל'}
          </Typography>
        </Paper>
      )}

      {isEditDialogOpen && selectedReminder && (
        <ReminderForm
          open={isEditDialogOpen}
          onClose={handleDialogClose}
          reminder={selectedReminder}
        />
      )}
    </Box>
  );
};

export default ReminderList;