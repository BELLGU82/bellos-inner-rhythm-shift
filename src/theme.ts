// src/theme.ts
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';

// Priority colors for reminders
export const ReminderPriorityColors = {
  high: '#f44336', // Red
  medium: '#ff9800', // Orange
  low: '#4caf50', // Green
};

// Create theme instance
let theme = createTheme(
  {
    direction: 'rtl',
    palette: {
      primary: {
        main: '#2196f3', // Blue
        light: '#64b5f6',
        dark: '#1976d2',
      },
      secondary: {
        main: '#9c27b0', // Purple
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
      error: {
        main: '#f44336', // Red
        light: '#e57373',
        dark: '#d32f2f',
      },
      warning: {
        main: '#ff9800', // Orange
        light: '#ffb74d',
        dark: '#f57c00',
      },
      info: {
        main: '#2196f3', // Blue
        light: '#64b5f6',
        dark: '#1976d2',
      },
      success: {
        main: '#4caf50', // Green
        light: '#81c784',
        dark: '#388e3c',
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
    },
    typography: {
      fontFamily: [
        'Rubik',
        'Assistant',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&family=Assistant:wght@300;400;600;700&display=swap');
          
          html {
            height: 100%;
          }
          
          body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          
          #root {
            height: 100%;
          }
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  },
  heIL
);

// Apply responsive font sizes
theme = responsiveFontSizes(theme);

export default theme;