// src/components/Reminders/ReminderForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
  Box,
  SelectChangeEvent,
  IconButton
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import CloseIcon from '@mui/icons-material/Close';
import { Reminder, addReminder, updateReminder } from '../../services/reminderService';

interface ReminderFormProps {
  open: boolean;
  onClose: () => void;
  reminder?: Reminder | null; // If provided, we're editing an existing reminder
  onSave: () => void;
}

// Common categories for reminders - can be expanded
const CATEGORIES = [
  'אישי',
  'עבודה',
  'בריאות',
  'משפחה',
  'כספים',
  'לימודים',
  'אחר'
];

const defaultReminder: Reminder = {
  id: '',
  title: '',
  description: '',
  completed: false,
  createdAt: new Date(),
  dueDate: null,
  priority: 'medium',
  category: '',
  recurring: false,
  recurringPattern: null,
  tags: []
};

export const ReminderForm: React.FC<ReminderFormProps> = ({
  open,
  onClose,
  reminder,
  onSave
}) => {
  const [formData, setFormData] = useState<Reminder>({ ...defaultReminder });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with reminder data if editing
  useEffect(() => {
    if (reminder) {
      setFormData({
        ...reminder,
        // Ensure date objects are properly handled
        dueDate: reminder.dueDate ? new Date(reminder.dueDate) : null,
        createdAt: new Date(reminder.createdAt),
      });
    } else {
      setFormData({ ...defaultReminder, id: crypto.randomUUID() });
    }
  }, [reminder, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation errors when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'נדרשת כותרת לתזכורת';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const reminderToSave = { 
      ...formData,
      // Ensure created date is set for new reminders
      createdAt: reminder ? formData.createdAt : new Date(),
    };
    
    if (reminder) {
      // Update existing reminder
      updateReminder(reminderToSave);
    } else {
      // Add new reminder
      addReminder(reminderToSave);
    }
    
    onSave();
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {reminder ? 'עריכת תזכורת' : 'תזכורת חדשה'}
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="כותרת"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.title}
              helperText={errors.title}
              autoFocus
            />
            
            <TextField
              label="תיאור"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
            
            <DateTimePicker
              label="תאריך יעד"
              value={formData.dueDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined'
                }
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel id="priority-label">עדיפות</InputLabel>
              <Select
                labelId="priority-label"
                name="priority"
                value={formData.priority}
                onChange={handleSelectChange}
                label="עדיפות"
              >
                <MenuItem value="low">נמוכה</MenuItem>
                <MenuItem value="medium">בינונית</MenuItem>
                <MenuItem value="high">גבוהה</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel id="category-label">קטגוריה</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={formData.category || ''}
                onChange={handleSelectChange}
                label="קטגוריה"
              >
                <MenuItem value="">
                  <em>ללא קטגוריה</em>
                </MenuItem>
                {CATEGORIES.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.recurring}
                    onChange={handleCheckboxChange}
                    name="recurring"
                  />
                }
                label="תזכורת חוזרת"
              />
              
              {formData.recurring && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="recurring-pattern-label">תבנית חזרה</InputLabel>
                  <Select
                    labelId="recurring-pattern-label"
                    name="recurringPattern"
                    value={formData.recurringPattern || ''}
                    onChange={handleSelectChange}
                    label="תבנית חזרה"
                  >
                    <MenuItem value="daily">יומי</MenuItem>
                    <MenuItem value="weekly">שבועי</MenuItem>
                    <MenuItem value="monthly">חודשי</MenuItem>
                    <MenuItem value="yearly">שנתי</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
            
            {reminder && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.completed}
                    onChange={handleCheckboxChange}
                    name="completed"
                  />
                }
                label="הושלם"
              />
            )}
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          ביטול
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {reminder ? 'עדכון' : 'הוספה'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderForm;