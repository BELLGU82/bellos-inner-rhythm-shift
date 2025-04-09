// src/components/Reminders/ReminderList.tsx
import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemSecondaryAction,
  Checkbox, 
  IconButton, 
  Typography, 
  Chip, 
  Box, 
  Divider,
  Paper,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  Category as CategoryIcon,
  Repeat as RepeatIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Reminder, toggleReminderCompletion, deleteReminder } from '../../services/reminderService';

interface ReminderListProps {
  reminders: Reminder[];
  onEditReminder: (reminder: Reminder) => void;
  onReminderChange: () => void;
  emptyMessage?: string;
}

export const ReminderList: React.FC<ReminderListProps> = ({
  reminders,
  onEditReminder,
  onReminderChange,
  emptyMessage = 'אין תזכורות'
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);

  const handleToggleCompletion = (id: string) => {
    toggleReminderCompletion(id);
    onReminderChange();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedReminderId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedReminderId(null);
  };

  const handleDelete = () => {
    if (selectedReminderId) {
      deleteReminder(selectedReminderId);
      onReminderChange();
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedReminderId) {
      const reminder = reminders.find(r => r.id === selectedReminderId);
      if (reminder) {
        onEditReminder(reminder);
      }
    }
    handleMenuClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDueDate = (date: Date | null) => {
    if (!date) return 'אין תאריך יעד';
    return format(date, 'PPpp', { locale: he });
  };

  if (reminders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="textSecondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', marginBottom: 3 }}>
      <List disablePadding>
        {reminders.map((reminder, index) => (
          <React.Fragment key={reminder.id}>
            {index > 0 && <Divider variant="inset" component="li" />}
            <ListItem 
              alignItems="flex-start"
              sx={{
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
                textDecoration: reminder.completed ? 'line-through' : 'none',
                color: reminder.completed ? 'text.disabled' : 'text.primary',
              }}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={reminder.completed}
                  onChange={() => handleToggleCompletion(reminder.id)}
                  sx={{ 
                    '&.Mui-checked': {
                      color: 'primary.main',
                    }
                  }}
                />
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Typography variant="subtitle1" component="span" fontWeight={500}>
                    {reminder.title}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {reminder.description && (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1 }}
                      >
                        {reminder.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {reminder.dueDate && (
                        <Tooltip title="תאריך יעד">
                          <Chip
                            size="small"
                            icon={<AccessTimeIcon />}
                            label={formatDueDate(reminder.dueDate)}
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                      
                      <Tooltip title="עדיפות">
                        <Chip
                          size="small"
                          icon={<FlagIcon />}
                          label={
                            reminder.priority === 'high' ? 'גבוהה' : 
                            reminder.priority === 'medium' ? 'בינונית' : 'נמוכה'
                          }
                          color={getPriorityColor(reminder.priority)}
                          variant="outlined"
                        />
                      </Tooltip>
                      
                      {reminder.category && (
                        <Tooltip title="קטגוריה">
                          <Chip
                            size="small"
                            icon={<CategoryIcon />}
                            label={reminder.category}
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                      
                      {reminder.recurring && (
                        <Tooltip title="חוזרת">
                          <Chip
                            size="small"
                            icon={<RepeatIcon />}
                            label="חוזרת"
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={(e) => handleMenuOpen(e, reminder.id)}>
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ערוך</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>מחק</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default ReminderList;