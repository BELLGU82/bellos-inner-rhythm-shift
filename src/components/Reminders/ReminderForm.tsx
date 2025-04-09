// src/components/Reminders/ReminderForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  Stack,
  Grid,
  IconButton,
  Typography,
  Chip,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { he } from 'date-fns/locale';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { Reminder, addReminder, updateReminder } from '../../services/reminderService';

interface ReminderFormProps {
  open: boolean;
  onClose: () => void;
  reminder?: Reminder;
}

const initialReminderState: Reminder = {
  id: '',
  title: '',
  description: '',
  completed: false,
  createdAt: new Date(),
  dueDate: null,
  priority: 'medium',
  category: '',
  recurring: false,
  recurringPattern: 'daily',
  tags: [],
};

const categories = ['עבודה', 'אישי', 'בריאות', 'משפחה', 'כספים', 'לימודים', 'אחר'];
const priorities = [
  { value: 'low', label: 'נמוכה' },
  { value: 'medium', label: 'בינונית' },
  { value: 'high', label: 'גבוהה' },
];
const recurringPatterns = [
  { value: 'daily', label: 'יומי' },
  { value: 'weekly', label: 'שבועי' },
  { value: 'biweekly', label: 'דו-שבועי' },
  { value: 'monthly', label: 'חודשי' },
  { value: 'yearly', label: 'שנתי' },
];

const ReminderForm: React.FC<ReminderFormProps> = ({ open, onClose, reminder }) => {
  const [formData, setFormData] = useState<Reminder>(initialReminderState);
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (reminder) {
      setFormData({
        ...reminder,
        dueDate: reminder.dueDate ? new Date(reminder.dueDate) : null,
      });
      
      if (reminder.dueDate) {
        setDueTime(new Date(reminder.dueDate));
      }
    } else {
      // Set default due date to tomorrow noon
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      
      setFormData({
        ...initialReminderState,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        dueDate: tomorrow,
      });
      
      setDueTime(tomorrow);
    }
  }, [reminder]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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
    if (date) {
      // Preserve time if set, otherwise set to noon
      if (dueTime) {
        date.setHours(
          dueTime.getHours(),
          dueTime.getMinutes(),
          dueTime.getSeconds(),
          dueTime.getMilliseconds()
        );
      } else {
        date.setHours(12, 0, 0, 0);
      }
    }
    
    setFormData(prev => ({ ...prev, dueDate: date }));
  };

  const handleTimeChange = (time: Date | null) => {
    setDueTime(time);
    
    if (time && formData.dueDate) {
      const updatedDate = new Date(formData.dueDate);
      updatedDate.setHours(
        time.getHours(),
        time.getMinutes(),
        time.getSeconds(),
        time.getMilliseconds()
      );
      
      setFormData(prev => ({ ...prev, dueDate: updatedDate }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() === '') return;
    
    if (!formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
    }
    
    setNewTag('');
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete),
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() === '') return;
    setFormData(prev => ({ ...prev, category: newCategory.trim() }));
    setNewCategory('');
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'יש להזין כותרת לתזכורת';
    }
    
    if (formData.recurring && !formData.recurringPattern) {
      newErrors.recurringPattern = 'יש לבחור תבנית חזרה';
    }
    
    if (formData.recurring && !formData.dueDate) {
      newErrors.dueDate = 'יש להגדיר תאריך יעד לתזכורת חוזרת';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    if (reminder) {
      updateReminder(formData);
    } else {
      addReminder(formData);
    }
    
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {reminder ? 'עריכת תזכורת' : 'תזכורת חדשה'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="כותרת"
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
                required
                autoFocus
                margin="normal"
                error={!!errors.title}
                helperText={errors.title}
                onKeyPress={handleKeyPress}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="תיאור"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="priority-label">עדיפות</InputLabel>
                <Select
                  labelId="priority-label"
                  name="priority"
                  value={formData.priority}
                  onChange={handleSelectChange}
                  label="עדיפות"
                >
                  {priorities.map(priority => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">קטגוריה</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  label="קטגוריה"
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                  <MenuItem value="other">אחר...</MenuItem>
                </Select>
              </FormControl>
              
              {formData.category === 'other' && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <TextField
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="הקלד קטגוריה חדשה"
                    size="small"
                    fullWidth
                  />
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleAddCategory}
                    size="small"
                  >
                    הוסף
                  </Button>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="תאריך יעד"
                value={formData.dueDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                    error: !!errors.dueDate,
                    helperText: errors.dueDate,
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="שעה"
                value={dueTime}
                onChange={handleTimeChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="recurring"
                    checked={formData.recurring}
                    onChange={handleCheckboxChange}
                  />
                }
                label="תזכורת חוזרת"
              />
              
              {formData.recurring && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="recurring-pattern-label">תבנית חזרה</InputLabel>
                  <Select
                    labelId="recurring-pattern-label"
                    name="recurringPattern"
                    value={formData.recurringPattern}
                    onChange={handleSelectChange}
                    label="תבנית חזרה"
                    error={!!errors.recurringPattern}
                  >
                    {recurringPatterns.map(pattern => (
                      <MenuItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                תגיות
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                {formData.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="הוסף תגית חדשה"
                  size="small"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  startIcon={<AddIcon />}
                >
                  הוסף
                </Button>
              </Stack>
            </Grid>
            
            {reminder && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="completed"
                      checked={formData.completed}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="בוצע"
                />
              </Grid>
            )}
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          ביטול
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          {reminder ? 'עדכן' : 'צור תזכורת'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderForm;