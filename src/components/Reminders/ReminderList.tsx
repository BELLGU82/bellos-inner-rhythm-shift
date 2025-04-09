import React, { useState, useEffect } from 'react';
import { Box, List, Typography, IconButton, Stack, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { Reminder, reminderService } from '../../services/reminderService';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import ReminderItem from './ReminderItem';

interface ReminderListProps {
  filter?: 'today' | 'upcoming' | 'all';
  category?: string;
  limit?: number;
  showActions?: boolean;
  showEmpty?: boolean;
  emptyMessage?: string;
}

const ReminderList: React.FC<ReminderListProps> = ({
  filter = 'all',
  category,
  limit,
  showActions = true,
  showEmpty = true,
  emptyMessage = 'אין תזכורות לתצוגה'
}) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  useEffect(() => {
    // Subscribe to reminder service updates
    const unsubscribe = reminderService.subscribe((updatedReminders) => {
      let filteredReminders = [...updatedReminders];
      
      // Apply filters
      if (filter === 'today') {
        filteredReminders = reminderService.getTodayReminders();
      } else if (filter === 'upcoming') {
        filteredReminders = reminderService.getUpcomingReminders();
      }
      
      // Filter by category if provided
      if (category) {
        filteredReminders = filteredReminders.filter(
          reminder => reminder.category === category
        );
      }
      
      // Apply limit if provided
      if (limit && limit > 0) {
        filteredReminders = filteredReminders.slice(0, limit);
      }
      
      setReminders(filteredReminders);
    });
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [filter, category, limit]);
  
  const handleComplete = (id: string) => {
    reminderService.completeReminder(id);
  };
  
  const handleDelete = (id: string) => {
    reminderService.deleteReminder(id);
  };
  
  if (reminders.length === 0 && showEmpty) {
    return (
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }
  
  return (
    <List sx={{ width: '100%' }}>
      {reminders.map((reminder) => (
        <ReminderItem
          key={reminder.id}
          reminder={reminder}
          showActions={showActions}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />
      ))}
    </List>
  );
};

export default ReminderList;