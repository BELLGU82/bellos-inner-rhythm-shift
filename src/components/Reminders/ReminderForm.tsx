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
  SelectChangeEvent
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { Reminder } from '../../services/reminderService';

interface ReminderFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
  initialData?: Partial<Reminder>;
  isEdit?: boolean;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'נמוכה' },
  { value: 'medium', label: 'בינונית' },
  { value: 'high', label: 'גבוהה' }
];

const CATEGORY_OPTIONS = [
  'אישי',
  'עבודה',
  'משפחה',
  'לימודים',
  'בריאות',
  'משימות',
  'אחר'
];

const ReminderForm: React.FC<ReminderFormProps> = ({
  open,
  onClose,
  onSave,
  initialData = {},
  isEdit = false
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [dueDate, setDueDate] = useState<Date | null>(initialData.dueDate || null);
  const [priority, setPriority] = useState(initialData.priority || 'medium');
  const [category, setCategory] = useState(initialData.category || '');
  const [recurring, setRecurring] = useState(initialData.recurring || false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setDueDate(initialData.dueDate || null);
      setPriority(initialData.priority || 'medium');
      setCategory(initialData.category || '');
      setRecurring(initialData.recurring || false);
      setErrors({});
    }
  }, [open, initialData]);

  const validate = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'שדה חובה';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }
    
    onSave({
      title,
      description,
      dueDate,
      priority: priority as 'low' | 'medium' | 'high',
      category: category || undefined,
      recurring
    });
    
    onClose();
  };

  const handlePriorityChange = (event: SelectChangeEvent<string>) => {
    setPriority(event.target.value);
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle dir="rtl">
        {isEdit ? 'עריכת תזכורת' : 'תזכורת חדשה'}
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }} dir="rtl">
          <TextField
            autoFocus
            label="כותרת"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            required
          />
          
          <TextField
            label="תיאור"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
            <DateTimePicker
              label="תאריך ושעה"
              value={dueDate}
              onChange={(newValue) => setDueDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined'
                }
              }}
            />
          </LocalizationProvider>
          
          <FormControl fullWidth>
            <InputLabel>עדיפות</InputLabel>
            <Select value={priority} onChange={handlePriorityChange} label="עדיפות">
              {PRIORITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>קטגוריה</InputLabel>
            <Select value={category} onChange={handleCategoryChange} label="קטגוריה">
              <MenuItem value="">
                <em>ללא קטגוריה</em>
              </MenuItem>
              {CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={recurring} 
                onChange={(e) => setRecurring(e.target.checked)} 
              />
            }
            label="תזכורת חוזרת"
          />
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          ביטול
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEdit ? 'עדכון' : 'שמירה'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderForm;