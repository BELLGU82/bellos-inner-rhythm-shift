
import React from 'react';
import { Moon, Sun, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const ThemeToggle: React.FC = () => {
  const { theme, isAdhd, toggleTheme, toggleAdhdMode } = useTheme();
  const { isRTL } = useLanguage();

  return (
    <div className={cn(
      "fixed z-50 flex gap-2",
      isRTL ? "left-4 top-4" : "right-4 top-4"
    )}>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="w-8 h-8 rounded-full"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        variant={isAdhd ? "default" : "outline"}
        size="icon"
        onClick={toggleAdhdMode}
        title={isAdhd ? 'Disable ADHD mode' : 'Enable ADHD mode'}
        className={cn(
          "w-8 h-8 rounded-full",
          isAdhd && "bg-bell-primary text-white"
        )}
      >
        <BrainCircuit className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ThemeToggle;
