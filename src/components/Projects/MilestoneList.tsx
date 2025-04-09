// src/components/Projects/MilestoneList.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  IconButton,
  Stack,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  useTheme,
  Checkbox,
  FormControlLabel,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import heLocale from 'date-fns/locale/he';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  Flag as FlagIcon,
  Event as EventIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { ProjectMilestone } from '../../types/projects';

interface MilestoneListProps {
  milestones: ProjectMilestone[];
  onMilestonesChange: (milestones: ProjectMilestone[]) => void;
}

const MilestoneList: React.FC<MilestoneListProps> = ({ milestones = [], onMilestonesChange }) => {
  const theme = useTheme();
  
  // State
  const [showAddMilestone, setShowAddMilestone] = useState<boolean>(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('timeline');
  
  // Default new milestone
  const defaultMilestone: Omit<ProjectMilestone, 'id'> = {
    title: '',
    description: '',
    dueDate: new Date().toISOString()
  };
  
  // Form state
  const [formData, setFormData] = useState<Omit<ProjectMilestone, 'id'>>(defaultMilestone);
  
  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      dueDate: date ? date.toISOString() : new Date().toISOString()
    }));
  };
  
  // Add new milestone
  const handleAddMilestone = () => {
    // Validate the milestone
    if (!formData.title.trim()) return;
    
    const newMilestone: ProjectMilestone = {
      id: uuidv4(),
      ...formData
    };
    
    const updatedMilestones = [...milestones, newMilestone];
    // Sort by due date
    updatedMilestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    onMilestonesChange(updatedMilestones);
    
    // Reset form
    setFormData(defaultMilestone);
    setShowAddMilestone(false);
  };
  
  // Start editing a milestone
  const handleStartEdit = (milestoneId: string) => {
    const milestoneToEdit = milestones.find(milestone => milestone.id === milestoneId);
    if (!milestoneToEdit) return;
    
    setFormData({
      title: milestoneToEdit.title,
      description: milestoneToEdit.description || '',
      dueDate: milestoneToEdit.dueDate,
      completedAt: milestoneToEdit.completedAt
    });
    
    setEditingMilestoneId(milestoneId);
    setShowAddMilestone(true);
  };
  
  // Update milestone
  const handleUpdateMilestone = () => {
    if (!editingMilestoneId || !formData.title.trim()) return;
    
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === editingMilestoneId) {
        return {
          ...milestone,
          ...formData
        };
      }
      return milestone;
    });
    
    // Sort by due date
    updatedMilestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    onMilestonesChange(updatedMilestones);
    
    // Reset form
    setFormData(defaultMilestone);
    setEditingMilestoneId(null);
    setShowAddMilestone(false);
  };
  
  // Delete milestone
  const handleDeleteMilestone = (milestoneId: string) => {
    setConfirmDeleteId(milestoneId);
  };
  
  // Confirm milestone deletion
  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      const updatedMilestones = milestones.filter(milestone => milestone.id !== confirmDeleteId);
      onMilestonesChange(updatedMilestones);
      setConfirmDeleteId(null);
    }
  };
  
  // Toggle milestone completion
  const handleToggleCompletion = (milestoneId: string) => {
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === milestoneId) {
        const isComplete = !!milestone.completedAt;
        return {
          ...milestone,
          completedAt: isComplete ? undefined : new Date().toISOString()
        };
      }
      return milestone;
    });
    
    onMilestonesChange(updatedMilestones);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };
  
  // Check if milestone is overdue
  const isOverdue = (milestone: ProjectMilestone) => {
    if (milestone.completedAt) return false;
    const now = new Date();
    const dueDate = new Date(milestone.dueDate);
    return dueDate < now;
  };
  
  // Get status color
  const getStatusColor = (milestone: ProjectMilestone) => {
    if (milestone.completedAt) {
      return theme.palette.success.main;
    }
    
    return isOverdue(milestone) ? theme.palette.error.main : theme.palette.info.main;
  };
  
  // Render milestone form
  const renderMilestoneForm = () => {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {editingMilestoneId ? 'עריכת אבן דרך' : 'אבן דרך חדשה'}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="כותרת"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תיאור"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
                <DatePicker
                  label="תאריך יעד"
                  value={formData.dueDate ? new Date(formData.dueDate) : null}
                  onChange={handleDateChange}
                  sx={{ width: '100%' }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!formData.completedAt}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        completedAt: e.target.checked ? new Date().toISOString() : undefined
                      }));
                    }}
                  />
                }
                label="הושלם"
              />
              {formData.completedAt && (
                <Typography variant="caption" display="block" color="text.secondary">
                  הושלם בתאריך: {formatDate(formData.completedAt)}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowAddMilestone(false);
                    setEditingMilestoneId(null);
                    setFormData(defaultMilestone);
                  }}
                >
                  ביטול
                </Button>
                
                <Button
                  variant="contained"
                  onClick={editingMilestoneId ? handleUpdateMilestone : handleAddMilestone}
                  disabled={!formData.title.trim()}
                >
                  {editingMilestoneId ? 'עדכן אבן דרך' : 'הוסף אבן דרך'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  // Render milestone in timeline mode
  const renderTimelineView = () => {
    if (milestones.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body1" color="text.secondary">
            אין אבני דרך עדיין
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            לחץ על "הוסף אבן דרך חדשה" כדי להתחיל
          </Typography>
        </Box>
      );
    }
    
    return (
      <Timeline position="alternate" sx={{ p: 0 }}>
        {milestones.map((milestone, index) => {
          const isCompleted = !!milestone.completedAt;
          const statusColor = getStatusColor(milestone);
          
          return (
            <TimelineItem key={milestone.id}>
              <TimelineOppositeContent sx={{ m: 'auto 0' }}>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(milestone.dueDate)}
                </Typography>
                {isCompleted && (
                  <Typography variant="caption" color="success.main">
                    הושלם ב-{formatDate(milestone.completedAt!)}
                  </Typography>
                )}
                {isOverdue(milestone) && (
                  <Typography variant="caption" color="error.main">
                    באיחור
                  </Typography>
                )}
              </TimelineOppositeContent>
              
              <TimelineSeparator>
                <TimelineDot 
                  color={isCompleted ? 'success' : isOverdue(milestone) ? 'error' : 'primary'}
                  variant={isCompleted ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleToggleCompletion(milestone.id)}
                >
                  {isCompleted ? <CompletedIcon /> : <FlagIcon />}
                </TimelineDot>
                {index < milestones.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              
              <TimelineContent sx={{ py: 2, px: 2 }}>
                <Paper elevation={3} sx={{ p: 2, borderRight: `4px solid ${statusColor}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div">
                      {milestone.title}
                    </Typography>
                    <Box>
                      <Tooltip title="ערוך">
                        <IconButton size="small" onClick={() => handleStartEdit(milestone.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק">
                        <IconButton size="small" onClick={() => handleDeleteMilestone(milestone.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {milestone.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {milestone.description}
                    </Typography>
                  )}
                </Paper>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    );
  };
  
  // Render milestone in table mode
  const renderTableView = () => {
    if (milestones.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body1" color="text.secondary">
            אין אבני דרך עדיין
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            לחץ על "הוסף אבן דרך חדשה" כדי להתחיל
          </Typography>
        </Box>
      );
    }
    
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="5%"></TableCell>
              <TableCell>אבן דרך</TableCell>
              <TableCell align="center">תאריך יעד</TableCell>
              <TableCell align="center">סטטוס</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {milestones.map((milestone) => {
              const isCompleted = !!milestone.completedAt;
              
              return (
                <TableRow 
                  key={milestone.id}
                  sx={{ 
                    bgcolor: isCompleted ? 'action.selected' : isOverdue(milestone) ? 'error.lightest' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Checkbox
                      checked={isCompleted}
                      onChange={() => handleToggleCompletion(milestone.id)}
                      icon={<PendingIcon />}
                      checkedIcon={<CompletedIcon />}
                      sx={{ color: isCompleted ? 'success.main' : 'inherit' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">
                      {milestone.title}
                    </Typography>
                    {milestone.description && (
                      <Typography variant="caption" color="text.secondary">
                        {milestone.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {formatDate(milestone.dueDate)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={isCompleted ? 'הושלם' : isOverdue(milestone) ? 'באיחור' : 'ממתין'}
                      size="small"
                      color={isCompleted ? 'success' : isOverdue(milestone) ? 'error' : 'primary'}
                      variant={isCompleted ? 'filled' : 'outlined'}
                    />
                    {isCompleted && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {formatDate(milestone.completedAt!)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="ערוך">
                        <IconButton size="small" onClick={() => handleStartEdit(milestone.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק">
                        <IconButton size="small" onClick={() => handleDeleteMilestone(milestone.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Box>
      {/* View Toggle and Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Button
            variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('timeline')}
            sx={{ mr: 1 }}
          >
            ציר זמן
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('table')}
          >
            טבלה
          </Button>
        </Box>
        
        {!showAddMilestone && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setFormData(defaultMilestone);
              setEditingMilestoneId(null);
              setShowAddMilestone(true);
            }}
          >
            הוסף אבן דרך חדשה
          </Button>
        )}
      </Box>
      
      {/* Milestone Form */}
      {showAddMilestone && renderMilestoneForm()}
      
      {/* Milestones View (Timeline or Table) */}
      <Box sx={{ mt: 3 }}>
        {viewMode === 'timeline' ? renderTimelineView() : renderTableView()}
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
      >
        <DialogTitle>מחיקת אבן דרך</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את אבן הדרך?
            פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>
            ביטול
          </Button>
          <Button color="error" onClick={handleConfirmDelete} autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MilestoneList;