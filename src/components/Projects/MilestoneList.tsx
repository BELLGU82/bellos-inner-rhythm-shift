
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { Milestone } from '../../types/Project';
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '../../utils/dateUtils';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface MilestoneListProps {
  projectId: string;
  milestones: Milestone[];
  onUpdate: () => void;
}

const MilestoneList: React.FC<MilestoneListProps> = ({ projectId, milestones, onUpdate }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null);
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleAddMilestone = () => {
    setEditMilestone(null);
    setFormValues({
      title: '',
      description: '',
      dueDate: ''
    });
    setDate(undefined);
    setOpenDialog(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditMilestone(milestone);
    setFormValues({
      title: milestone.title,
      description: milestone.description || '',
      dueDate: milestone.dueDate
    });
    setDate(new Date(milestone.dueDate));
    setOpenDialog(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      setFormValues({
        ...formValues,
        dueDate: newDate.toISOString()
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formValues.title.trim()) {
      newErrors.title = 'שם אבן הדרך הוא שדה חובה';
    }
    
    if (!formValues.dueDate) {
      newErrors.dueDate = 'תאריך יעד הוא שדה חובה';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      if (editMilestone) {
        // Logic for updating milestone
        console.log('Updating milestone:', {
          ...editMilestone,
          ...formValues
        });
      } else {
        // Logic for creating new milestone
        const newMilestone: Milestone = {
          id: uuidv4(),
          title: formValues.title,
          description: formValues.description,
          dueDate: formValues.dueDate,
          createdAt: new Date().toISOString()
        };
        console.log('Creating new milestone:', newMilestone);
      }
      
      // Refresh the milestones list
      onUpdate();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving milestone:', error);
    }
  };

  const handleToggleComplete = async (milestone: Milestone) => {
    try {
      const updatedMilestone = {
        ...milestone,
        completed: !milestone.completed,
        completedAt: !milestone.completed ? new Date().toISOString() : undefined
      };
      
      console.log('Toggling milestone completion:', updatedMilestone);
      
      // Refresh the milestones list
      onUpdate();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      console.log('Deleting milestone:', milestoneId);
      
      // Refresh the milestones list
      onUpdate();
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  return (
    <Box>
      {milestones.length === 0 ? (
        <Box textAlign="center" py={2}>
          <Typography variant="body2" color="textSecondary">
            אין אבני דרך לפרויקט זה
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddMilestone}
            sx={{ mt: 1 }}
          >
            הוסף אבן דרך
          </Button>
        </Box>
      ) : (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">
              אבני דרך ({milestones.length})
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddMilestone}
            >
              הוסף
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {milestones.map((milestone) => (
              <Card key={milestone.id} variant="outlined">
                <CardContent sx={{ pb: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {milestone.title}
                      </Typography>
                      
                      {milestone.description && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          {milestone.description}
                        </Typography>
                      )}
                      
                      <Box display="flex" gap={1} mt={1}>
                        <Chip 
                          size="small"
                          label={formatDate(milestone.dueDate)}
                          color={milestone.completed ? 'success' : 'default'}
                          icon={milestone.completed ? <CompletedIcon /> : <PendingIcon />}
                        />
                      </Box>
                    </Box>
                    
                    <Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={milestone.completed || false}
                            onChange={() => handleToggleComplete(milestone)}
                            color="primary"
                          />
                        }
                        label="הושלם"
                      />
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditMilestone(milestone)}
                  >
                    עריכה
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteMilestone(milestone.id)}
                  >
                    מחיקה
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Box>
      )}
      
      {/* Milestone Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMilestone ? 'עריכת אבן דרך' : 'הוספת אבן דרך'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="title"
              label="כותרת"
              value={formValues.title}
              onChange={handleChange}
              fullWidth
              error={!!errors.title}
              helperText={errors.title}
            />
            
            <TextField
              name="description"
              label="תיאור"
              value={formValues.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
            
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                תאריך יעד
              </Typography>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outlined"
                    fullWidth
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
              {errors.dueDate && (
                <Typography variant="caption" color="error">
                  {errors.dueDate}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMilestone ? 'עדכון' : 'הוספה'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MilestoneList;
