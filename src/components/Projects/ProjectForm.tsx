// src/components/Projects/ProjectForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Paper,
  useTheme,
  SelectChangeEvent,
  Autocomplete,
  Tooltip,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
  IconButton,
  Divider,
  InputAdornment,
  Stack
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import heLocale from 'date-fns/locale/he';
import {
  Save as SaveIcon,
  DeleteOutline as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  FlagOutlined as PriorityIcon,
  Category as CategoryIcon,
  Group as TeamIcon,
  LocalOffer as TagIcon,
  AttachMoney as BudgetIcon
} from '@mui/icons-material';
import { Project, ProjectStatus, ProjectPriority } from '../../types/projects';
import { 
  createProject, 
  updateProject, 
  deleteProject, 
  getAllCategories, 
  getAllTags, 
  addCategory 
} from '../../services/projectService';
import TaskList from './TaskList';
import MilestoneList from './MilestoneList';

interface ProjectFormProps {
  project?: Project;
  onSubmit?: (project: Project) => void;
  onCancel?: () => void;
  onDelete?: (id: string) => void;
}

// Default project object
const defaultProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress'> = {
  title: '',
  description: '',
  status: 'בתכנון',
  priority: 'בינונית',
  startDate: new Date().toISOString(),
  category: 'כללי',
  tags: [],
  tasks: [],
  milestones: [],
  team: [],
  owner: '',
  isArchived: false
};

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onCancel,
  onDelete
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for the form
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress'>>({
    ...defaultProject
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [teamMember, setTeamMember] = useState<string>('');
  
  // Load existing data if editing
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate,
        dueDate: project.dueDate,
        completedAt: project.completedAt,
        category: project.category,
        tags: [...project.tags],
        tasks: [...project.tasks],
        milestones: [...project.milestones],
        team: [...project.team],
        owner: project.owner,
        notes: project.notes,
        budget: project.budget,
        actualCost: project.actualCost,
        attachments: project.attachments ? [...project.attachments] : [],
        isArchived: project.isArchived
      });
    }
  }, [project]);
  
  // Load categories and tags
  useEffect(() => {
    setCategories(getAllCategories());
    setAllTags(getAllTags());
  }, []);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value)
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date change
  const handleStartDateChange = (newDate: Date | null) => {
    setFormData(prev => ({
      ...prev,
      startDate: newDate ? newDate.toISOString() : new Date().toISOString()
    }));
  };
  
  // Handle due date change
  const handleDueDateChange = (newDate: Date | null) => {
    setFormData(prev => ({
      ...prev,
      dueDate: newDate ? newDate.toISOString() : undefined
    }));
  };
  
  // Add a new tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (!formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
    }
    
    setNewTag('');
  };
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Add a new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    if (!categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      addCategory(newCategory.trim());
    }
    
    setFormData(prev => ({
      ...prev,
      category: newCategory.trim()
    }));
    
    setNewCategory('');
  };
  
  // Add team member
  const handleAddTeamMember = () => {
    if (!teamMember.trim()) return;
    
    if (!formData.team.includes(teamMember.trim())) {
      setFormData(prev => ({
        ...prev,
        team: [...prev.team, teamMember.trim()]
      }));
    }
    
    setTeamMember('');
  };
  
  // Remove team member
  const handleRemoveTeamMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(m => m !== member)
    }));
  };
  
  // Update tasks
  const handleTasksUpdate = (tasks: any[]) => {
    setFormData(prev => ({
      ...prev,
      tasks
    }));
  };
  
  // Update milestones
  const handleMilestonesUpdate = (milestones: any[]) => {
    setFormData(prev => ({
      ...prev,
      milestones
    }));
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'שם הפרויקט הוא שדה חובה';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'תאריך התחלה הוא שדה חובה';
    }
    
    if (!formData.owner.trim()) {
      newErrors.owner = 'אחראי פרויקט הוא שדה חובה';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Create or update the project
      if (project) {
        // Update existing project
        const updatedProject = await updateProject({
          ...formData,
          id: project.id,
          createdAt: project.createdAt,
          updatedAt: new Date().toISOString(),
          progress: project.progress
        });
        
        if (onSubmit) onSubmit(updatedProject);
      } else {
        // Create new project
        const newProject = await createProject(formData);
        
        if (onSubmit) onSubmit(newProject);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      // Handle error (could add error state and display to user)
    }
  };
  
  // Handle delete
  const handleDeleteClick = () => {
    setConfirmDeleteOpen(true);
  };
  
  // Confirm delete
  const handleConfirmDelete = async () => {
    if (project && project.id) {
      try {
        await deleteProject(project.id);
        if (onDelete) onDelete(project.id);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
    setConfirmDeleteOpen(false);
  };
  
  // Render basic information tab
  const renderBasicInfoTab = () => {
    return (
      <Grid container spacing={3}>
        {/* Title */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="שם הפרויקט"
            name="title"
            value={formData.title}
            onChange={handleChange}
            variant="outlined"
            error={!!errors.title}
            helperText={errors.title}
            required
          />
        </Grid>
        
        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="תיאור"
            name="description"
            value={formData.description}
            onChange={handleChange}
            variant="outlined"
            multiline
            rows={4}
          />
        </Grid>
        
        {/* Status and priority side by side */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="status-label">סטטוס</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={formData.status}
              onChange={handleSelectChange}
              label="סטטוס"
            >
              <MenuItem value="בתכנון">בתכנון</MenuItem>
              <MenuItem value="בתהליך">בתהליך</MenuItem>
              <MenuItem value="מעוכב">מעוכב</MenuItem>
              <MenuItem value="הושלם">הושלם</MenuItem>
              <MenuItem value="בוטל">בוטל</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="priority-label">עדיפות</InputLabel>
            <Select
              labelId="priority-label"
              name="priority"
              value={formData.priority}
              onChange={handleSelectChange}
              label="עדיפות"
              startAdornment={
                <InputAdornment position="start">
                  <PriorityIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="נמוכה">נמוכה</MenuItem>
              <MenuItem value="בינונית">בינונית</MenuItem>
              <MenuItem value="גבוהה">גבוהה</MenuItem>
              <MenuItem value="דחופה">דחופה</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {/* Dates side by side */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
            <DatePicker
              label="תאריך התחלה"
              value={formData.startDate ? new Date(formData.startDate) : null}
              onChange={handleStartDateChange}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  required: true,
                  error: !!errors.startDate,
                  helperText: errors.startDate
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
            <DatePicker
              label="תאריך יעד"
              value={formData.dueDate ? new Date(formData.dueDate) : null}
              onChange={handleDueDateChange}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        
        {/* Category */}
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="category-label">קטגוריה</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={formData.category}
              onChange={handleSelectChange}
              label="קטגוריה"
              startAdornment={
                <InputAdornment position="start">
                  <CategoryIcon />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip title="הוסף קטגוריה חדשה">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewCategory('');
                      }}
                      sx={{ ml: 1 }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              }
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* New Category Input - shows when adding new category */}
        {newCategory !== undefined && newCategory !== null && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="קטגוריה חדשה"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleAddCategory}
                      edge="end"
                      disabled={!newCategory.trim()}
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        )}
        
        {/* Tags */}
        <Grid item xs={12}>
          <Autocomplete
            multiple
            freeSolo
            id="tags"
            options={allTags.filter(tag => !formData.tags.includes(tag))}
            value={formData.tags}
            onChange={(_, newValue) => {
              setFormData(prev => ({
                ...prev,
                tags: newValue as string[]
              }));
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                  icon={<TagIcon />}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="תגיות"
                placeholder="הוסף תגית"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <TagIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </Grid>
        
        {/* Owner */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="אחראי פרויקט"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            variant="outlined"
            error={!!errors.owner}
            helperText={errors.owner}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TeamIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        {/* Team */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            צוות הפרויקט
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {formData.team.map((member) => (
              <Chip
                key={member}
                label={member}
                onDelete={() => handleRemoveTeamMember(member)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
          <Box sx={{ display: 'flex' }}>
            <TextField
              fullWidth
              label="הוסף חבר צוות"
              value={teamMember}
              onChange={(e) => setTeamMember(e.target.value)}
              variant="outlined"
              sx={{ mr: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TeamIcon />
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddTeamMember}
              disabled={!teamMember.trim()}
            >
              <AddIcon />
            </Button>
          </Box>
        </Grid>
        
        {/* Budget and Actual Cost */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="תקציב (₪)"
            name="budget"
            type="number"
            value={formData.budget ?? ''}
            onChange={handleNumberChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BudgetIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="עלות בפועל (₪)"
            name="actualCost"
            type="number"
            value={formData.actualCost ?? ''}
            onChange={handleNumberChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BudgetIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        {/* Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="הערות"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            variant="outlined"
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    );
  };
  
  // Main rendering
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        width: '100%', 
        mb: 4
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
        >
          <Tab label="פרטים כלליים" />
          <Tab label="משימות" />
          <Tab label="אבני דרך" />
        </Tabs>
      </Box>
    
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ width: '100%' }}
      >
        {/* Tab content */}
        <Box sx={{ mb: 4 }}>
          {activeTab === 0 && renderBasicInfoTab()}
          
          {activeTab === 1 && (
            <TaskList 
              tasks={formData.tasks} 
              onTasksChange={handleTasksUpdate} 
            />
          )}
          
          {activeTab === 2 && (
            <MilestoneList 
              milestones={formData.milestones} 
              onMilestonesChange={handleMilestonesUpdate} 
            />
          )}
        </Box>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Box>
            {project && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
              >
                מחק פרויקט
              </Button>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {onCancel && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={onCancel}
              >
                ביטול
              </Button>
            )}
            
            <Button
              variant="contained"
              color="primary"
              type="submit"
              startIcon={<SaveIcon />}
            >
              {project ? 'עדכן פרויקט' : 'צור פרויקט'}
            </Button>
          </Box>
        </Box>
      </Box>
      
      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>מחיקת פרויקט</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את הפרויקט "{formData.title}"?
            פעולה זו לא ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">
            ביטול
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProjectForm;