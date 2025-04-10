
// Priority colors for reminders
export const ReminderPriorityColors = {
  high: '#f44336', // Red
  medium: '#ff9800', // Orange
  low: '#4caf50', // Green
};

// We'll use this as a simplified theme config without Material UI
export const themeConfig = {
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
};

export default themeConfig;
