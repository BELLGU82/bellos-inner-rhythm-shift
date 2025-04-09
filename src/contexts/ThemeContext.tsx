
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';
type AdhdMode = boolean;

interface ThemeContextType {
  theme: ThemeMode;
  isAdhd: AdhdMode;
  toggleTheme: () => void;
  toggleAdhdMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isAdhd: false,
  toggleTheme: () => {},
  toggleAdhdMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('bellOS-theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
  });
  
  const [isAdhd, setIsAdhd] = useState<AdhdMode>(() => {
    const savedMode = localStorage.getItem('bellOS-adhd-mode');
    return savedMode === 'true';
  });
  
  useEffect(() => {
    localStorage.setItem('bellOS-theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('bellOS-adhd-mode', String(isAdhd));
    
    if (isAdhd) {
      document.documentElement.classList.add('adhd-mode');
    } else {
      document.documentElement.classList.remove('adhd-mode');
    }
  }, [isAdhd]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const toggleAdhdMode = () => {
    setIsAdhd(prevMode => !prevMode);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, isAdhd, toggleTheme, toggleAdhdMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
