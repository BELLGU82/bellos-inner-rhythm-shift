import React from 'react';
import { 
  ListItem, 
  ListItemText, 
  Typography, 
  IconButton, 
  Stack, 
  Chip, 
  ListItemAvatar, 
  Avatar,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { Reminder } from '../../services/reminderService';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface ReminderItemProps {
  reminder: Reminder;
  showActions?: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({
  reminder,
  showActions = true,
  onComplete,
  onDelete
}) => {
  // Priority colors
  const priorityColors = {
    high: '#f44336',
    medium: '#ff9800',
    low: '#4caf50'
  };
  
  // Format the due date in Hebrew
  const formattedDueDate = reminder.dueDate
    ? formatDistanceToNow(reminder.dueDate, { addSuffix: true, locale: he })
    : 'ללא תאריך יעד';
  
  // Get priority color
  const priorityColor = priorityColors[reminder.priority] || priorityColors.low;
  
  return (
    <ListItem
      alignItems="flex-start"
      secondaryAction={
        showActions && (
          <Stack direction="row" spacing={1}>
            <IconButton 
              edge="end" 
              aria-label="complete" 
              onClick={() => onComplete(reminder.id)}
              color={reminder.completed ? 'primary' : 'default'}
            >
              {reminder.completed ? 
                <CheckCircleIcon /> : 
                <RadioButtonUncheckedIcon />
              }
            </IconButton>
            <IconButton 
              edge="end" 
              aria-label="delete" 
              onClick={() => onDelete(reminder.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        )
      }
      sx={{
        opacity: reminder.completed ? 0.6 : 1,
        textDecoration: reminder.completed ? 'line-through' : 'none',
        mb: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: priorityColor }}>
          {reminder.priority === 'high' && <PriorityHighIcon />}
        </Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Typography
            variant="subtitle1"
            sx={{ 
              textDecoration: reminder.completed ? 'line-through' : 'none',
              fontWeight: reminder.priority === 'high' ? 'bold' : 'normal'
            }}
          >
            {reminder.title}
          </Typography>
        }
        secondary={
          <React.Fragment>
            <Typography
              component="span"
              variant="body2"
              color="text.primary"
              sx={{ display: 'block' }}
            >
              {reminder.description}
            </Typography>
            
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                size="small" 
                label={formattedDueDate} 
                variant="outlined" 
              />
              
              {reminder.category && (
                <Chip 
                  size="small" 
                  label={reminder.category} 
                  color="primary" 
                  variant="outlined" 
                />
              )}
              
              {reminder.recurring && (
                <Chip 
                  size="small" 
                  label="חוזר" 
                  color="secondary" 
                  variant="outlined" 
                />
              )}
            </Box>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

export default ReminderItem;