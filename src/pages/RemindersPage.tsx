// src/pages/RemindersPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Fab,
  useTheme,
  useMediaQuery,
  Drawer,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Chip,
  Grid,
  AppBar,
  Toolbar,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  NotificationsActive as NotificationIcon,
  Today as TodayIcon,
  Assignment as TasksIcon,
  CheckCircle as CompletedIcon,
  Schedule as OverdueIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import ReminderList from '../components/Reminders/ReminderList';
import ReminderForm from '../components/Reminders/ReminderForm';
import { 
  Reminder, 
  getAllReminders, 
  getOverdueReminders, 
  getTodayReminders, 
  getAllCategories,
  getAllTags,
  initializeReminderSystem,
  processCompletedRecurringReminder
} from '../services/reminderService';

enum Tabs {
  ALL = 'all',
  TODAY = 'today',
  OVERDUE = 'overdue',
  COMPLETED = 'completed'
}

const RemindersPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // State
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>(Tabs.ALL);
  const [overdueCount, setOverdueCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  
  // Initialize and load data
  useEffect(() => {
    initializeReminderSystem();
    loadReminders();
    setCategories(getAllCategories());
    setTags(getAllTags());
    
    // Set up counts
    const overdue = getOverdueReminders();
    setOverdueCount(overdue.length);
    
    const today = getTodayReminders();
    setTodayCount(today.length);
    
    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      loadReminders();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Load reminders based on active tab
  const loadReminders = () => {
    let loadedReminders: Reminder[] = [];
    
    switch (activeTab) {
      case Tabs.TODAY:
        loadedReminders = getTodayReminders();
        break;
      case Tabs.OVERDUE:
        loadedReminders = getOverdueReminders();
        break;
      case Tabs.COMPLETED:
        loadedReminders = getAllReminders().filter(r => r.completed);
        break;
      case Tabs.ALL:
      default:
        loadedReminders = getAllReminders().filter(r => !r.completed);
        break;
    }
    
    setReminders(loadedReminders);
    
    // Update counts
    setOverdueCount(getOverdueReminders().length);
    setTodayCount(getTodayReminders().length);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };
  
  // Handler for when a reminder is selected for editing
  const handleReminderEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsFormOpen(true);
  };
  
  // Handler for form submission (create/update)
  const handleFormSubmit = (reminder: Reminder) => {
    // Handle recurring reminders that are completed
    if (reminder.completed && reminder.recurring) {
      processCompletedRecurringReminder(reminder);
    }
    
    loadReminders();
    setIsFormOpen(false);
    setEditingReminder(undefined);
  };
  
  // Handler for form cancellation
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingReminder(undefined);
  };
  
  // Handler for reminder deletion
  const handleReminderDelete = () => {
    loadReminders();
    setIsFormOpen(false);
    setEditingReminder(undefined);
  };
  
  // Handler for reminder status change (completed/uncompleted)
  const handleReminderStatusChange = () => {
    loadReminders();
  };
  
  // Determine Dialog/Drawer size based on device
  const getFormWidth = () => {
    if (isMobile) return '100%';
    if (isTablet) return '80%';
    return '60%';
  };
  
  // Render statistics cards
  const renderStatistics = () => {
    const totalReminders = getAllReminders();
    const completedReminders = totalReminders.filter(r => r.completed);
    const completionRate = totalReminders.length > 0 
      ? Math.round((completedReminders.length / totalReminders.length) * 100) 
      : 0;
    
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                סך הכל
              </Typography>
              <Typography variant="h3" component="div">
                {totalReminders.length}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                תזכורות
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                הושלמו
              </Typography>
              <Typography variant="h3" component="div">
                {completedReminders.length}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                תזכורות ({completionRate}%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRight: overdueCount > 0 ? `4px solid ${theme.palette.error.main}` : undefined 
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                באיחור
              </Typography>
              <Typography 
                variant="h3" 
                component="div" 
                color={overdueCount > 0 ? "error" : "inherit"}
              >
                {overdueCount}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                תזכורות לטיפול
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            borderRight: todayCount > 0 ? `4px solid ${theme.palette.primary.main}` : undefined
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                להיום
              </Typography>
              <Typography 
                variant="h3" 
                component="div"
                color={todayCount > 0 ? "primary" : "inherit"}
              >
                {todayCount}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                תזכורות לביצוע
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // Render filters and categories
  const renderFilters = () => {
    return (
      <Box sx={{ width: '100%', mb: 3 }}>
        <Paper square>
          <Tabs 
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab 
              icon={<TasksIcon />} 
              label="הכל" 
              value={Tabs.ALL} 
              iconPosition="start"
            />
            <Tab 
              icon={
                <Badge badgeContent={todayCount} color="primary">
                  <TodayIcon />
                </Badge>
              } 
              label="להיום" 
              value={Tabs.TODAY} 
              iconPosition="start"
            />
            <Tab 
              icon={
                <Badge badgeContent={overdueCount} color="error">
                  <OverdueIcon />
                </Badge>
              } 
              label="באיחור" 
              value={Tabs.OVERDUE} 
              iconPosition="start"
            />
            <Tab 
              icon={<CompletedIcon />} 
              label="הושלמו" 
              value={Tabs.COMPLETED} 
              iconPosition="start"
            />
          </Tabs>
        </Paper>
      </Box>
    );
  };
  
  // Render the reminder form (in Dialog or Drawer based on screen size)
  const renderReminderForm = () => {
    const formContent = (
      <ReminderForm
        reminder={editingReminder}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        onDelete={handleReminderDelete}
      />
    );
    
    // Use a Drawer for mobile, Dialog for larger screens
    if (isMobile) {
      return (
        <Drawer
          anchor="bottom"
          open={isFormOpen}
          onClose={handleFormCancel}
          PaperProps={{
            sx: {
              height: '90vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              p: 2
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {editingReminder ? 'עריכת תזכורת' : 'תזכורת חדשה'}
            </Typography>
            <IconButton onClick={handleFormCancel}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {formContent}
        </Drawer>
      );
    }
    
    return (
      <Dialog
        open={isFormOpen}
        onClose={handleFormCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            width: getFormWidth(),
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingReminder ? 'עריכת תזכורת' : 'תזכורת חדשה'}
            </Typography>
            <IconButton onClick={handleFormCancel} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ניהול תזכורות
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          נהל את כל התזכורות והמשימות שלך במקום אחד
        </Typography>
      </Box>
      
      {/* Statistics Dashboard */}
      {renderStatistics()}
      
      {/* Reminder List with Tabs */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 8 }}>
        {renderFilters()}
        
        <Box sx={{ position: 'relative', minHeight: '50vh' }}>
          <ReminderList
            reminders={reminders}
            onReminderEdit={handleReminderEdit}
            onStatusChange={handleReminderStatusChange}
          />
          
          {reminders.length === 0 && (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                height: '50vh',
                p: 3
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {activeTab === Tabs.COMPLETED 
                  ? 'אין תזכורות שהושלמו' 
                  : activeTab === Tabs.TODAY 
                    ? 'אין תזכורות להיום' 
                    : activeTab === Tabs.OVERDUE 
                      ? 'אין תזכורות באיחור' 
                      : 'אין תזכורות פעילות'}
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={() => setIsFormOpen(true)}
                sx={{ mt: 2 }}
              >
                צור תזכורת חדשה
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Add Button (FAB) */}
      <Tooltip title="צור תזכורת חדשה">
        <Fab 
          color="primary" 
          aria-label="add"
          onClick={() => {
            setEditingReminder(undefined);
            setIsFormOpen(true);
          }}
          sx={{
            position: 'fixed',
            bottom: theme.spacing(4),
            right: theme.spacing(4),
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      
      {/* Refresh Button */}
      <Tooltip title="רענן תזכורות">
        <Fab 
          color="secondary" 
          aria-label="refresh"
          onClick={loadReminders}
          size="small"
          sx={{
            position: 'fixed',
            bottom: theme.spacing(4),
            right: theme.spacing(12),
          }}
        >
          <RefreshIcon />
        </Fab>
      </Tooltip>
      
      {/* Reminder Form Dialog/Drawer */}
      {renderReminderForm()}
    </Container>
  );
};

export default RemindersPage;