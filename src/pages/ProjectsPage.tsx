import React, { useState } from 'react';
import { Box, Button, Typography, Container, Paper, useTheme, Fab, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ProjectList } from '../components/Projects/ProjectList';
import { ProjectForm } from '../components/Projects/ProjectForm';
import { Project } from '../types/Project';
import { v4 as uuidv4 } from 'uuid';

/**
 * Projects page component
 * @returns JSX.Element
 */
export const ProjectsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for project form dialog
  const [openProjectForm, setOpenProjectForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  
  /**
   * Handle opening the project form for creating new project
   */
  const handleCreateProject = () => {
    setEditProject(null);
    setOpenProjectForm(true);
  };
  
  /**
   * Handle opening the project form for editing existing project
   * @param project Project to edit
   */
  const handleEditProject = (project: Project) => {
    setEditProject(project);
    setOpenProjectForm(true);
  };
  
  /**
   * Handle closing the project form
   */
  const handleCloseProjectForm = () => {
    setOpenProjectForm(false);
    setEditProject(null);
  };
  
  /**
   * Create default new project template
   * @returns Project
   */
  const createDefaultProject = (): Project => {
    const now = new Date();
    const twoWeeksFromNow = new Date(now);
    twoWeeksFromNow.setDate(now.getDate() + 14);
    
    return {
      id: uuidv4(),
      title: '',
      description: '',
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dueDate: twoWeeksFromNow.toISOString(),
      completedAt: null,
      progress: 0,
      tags: [],
      milestones: []
    };
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: 3, 
          borderRadius: 2,
          background: theme.palette.background.paper
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              mb: { xs: 2, sm: 0 },
              color: theme.palette.primary.main
            }}
          >
            ניהול פרויקטים
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            פרויקט חדש
          </Button>
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4, 
            opacity: 0.8,
            maxWidth: 800
          }}
        >
          צור ונהל פרויקטים, עקוב אחר התקדמות, ונהל אבני דרך. סינון וחיפוש מתקדמים מאפשרים לך להתמקד במה שחשוב.
        </Typography>
        
        <ProjectList onEditProject={handleEditProject} />
      </Paper>
      
      {/* Mobile floating action button */}
      {isMobile && (
        <Fab 
          color="primary" 
          aria-label="הוסף פרויקט"
          onClick={handleCreateProject}
          sx={{ 
            position: 'fixed',
            bottom: 16,
            right: 16
          }}
        >
          <AddIcon />
        </Fab>
      )}
      
      {/* Project form dialog */}
      <ProjectForm
        open={openProjectForm}
        onClose={handleCloseProjectForm}
        project={editProject || createDefaultProject()}
        isEditMode={!!editProject}
      />
    </Container>
  );
};