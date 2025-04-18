
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
  Typography,
  Slider,
  Box
} from '@mui/material';
import { Project, ProjectFormValues } from '../../types/Project';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: ProjectFormValues) => void;
  initialValues?: Project;
  title: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title
}) => {
  const defaultValues: ProjectFormValues = {
    name: '',
    description: '',
    status: 'לא התחיל',
    progress: 0,
    dueDate: undefined
  };

  const [formValues, setFormValues] = useState<ProjectFormValues>(defaultValues);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (initialValues) {
      setFormValues({
        name: initialValues.name,
        description: initialValues.description,
        status: initialValues.status,
        progress: initialValues.progress,
        dueDate: initialValues.dueDate
      });
      
      if (initialValues.dueDate) {
        setDate(new Date(initialValues.dueDate));
      }
    } else {
      setFormValues(defaultValues);
      setDate(undefined);
    }
  }, [initialValues, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = event.target.name as string;
    const value = event.target.value;
    
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setFormValues({
      ...formValues,
      progress: newValue as number
    });
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    setFormValues({
      ...formValues,
      dueDate: newDate ? newDate.toISOString() : undefined
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formValues.name.trim()) {
      newErrors.name = 'שם הפרויקט הוא שדה חובה';
    }
    
    if (!formValues.description.trim()) {
      newErrors.description = 'תיאור הפרויקט הוא שדה חובה';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      onSubmit(formValues);
      if (!initialValues) {
        setFormValues(defaultValues);
      }
    }
  };

  const handleCancel = () => {
    setFormValues(defaultValues);
    setErrors({});
    onClose();
  };

  function valuetext(value: number) {
    return `${value}%`;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="שם הפרויקט"
              value={formValues.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
              inputProps={{ dir: 'rtl' }}
              variant="outlined"
            />
            
            <TextField
              name="description"
              label="תיאור הפרויקט"
              value={formValues.description}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description}
              inputProps={{ dir: 'rtl' }}
              variant="outlined"
            />
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="status-label">סטטוס</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formValues.status}
                  onChange={handleChange}
                  label="סטטוס"
                >
                  <MenuItem value="לא התחיל">לא התחיל</MenuItem>
                  <MenuItem value="בתהליך">בתהליך</MenuItem>
                  <MenuItem value="מושהה">מושהה</MenuItem>
                  <MenuItem value="הושלם">הושלם</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ width: '100%' }}>
                <InputLabel>תאריך יעד</InputLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}
                    >
                      {date ? format(date, 'PP', { locale: he }) : 'בחר תאריך'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </Box>
            </Box>
            
            <Box>
              <Typography id="progress-slider" gutterBottom>
                התקדמות: {formValues.progress}%
              </Typography>
              <Box sx={{ padding: '0 10px' }}>
                <Slider
                  aria-labelledby="progress-slider"
                  value={formValues.progress}
                  getAriaValueText={valuetext}
                  onChange={handleSliderChange}
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            ביטול
          </Button>
          <Button type="submit" color="primary" variant="contained">
            {initialValues ? 'עדכון' : 'יצירה'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectForm;
