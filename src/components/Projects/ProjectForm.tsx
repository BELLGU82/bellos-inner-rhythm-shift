import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Slider,
  Box
} from '@mui/material';
import { Project, ProjectFormValues } from '../../types/Project';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import heLocale from 'date-fns/locale/he';

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

  useEffect(() => {
    if (initialValues) {
      setFormValues({
        name: initialValues.name,
        description: initialValues.description,
        status: initialValues.status,
        progress: initialValues.progress,
        dueDate: initialValues.dueDate
      });
    } else {
      setFormValues(defaultValues);
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

  const handleDateChange = (date: Date | null) => {
    setFormValues({
      ...formValues,
      dueDate: date ? date.toISOString().split('T')[0] : undefined
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
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
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
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
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
                <DatePicker
                  label="תאריך יעד"
                  value={formValues.dueDate ? new Date(formValues.dueDate) : null}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
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
            </Grid>
          </Grid>
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