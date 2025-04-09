
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 neumorph-sm px-2 py-1 rounded-full">
      <button 
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-mono transition-all duration-200",
          language === 'en' 
            ? "bg-bell-primary text-white" 
            : "hover:bg-bell-subtle"
        )}
        onClick={() => setLanguage('en')}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button 
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-miriam transition-all duration-200",
          language === 'he' 
            ? "bg-bell-primary text-white" 
            : "hover:bg-bell-subtle"
        )}
        onClick={() => setLanguage('he')}
        aria-label="Switch to Hebrew"
      >
        עברית
      </button>
    </div>
  );
};

export default LanguageToggle;
