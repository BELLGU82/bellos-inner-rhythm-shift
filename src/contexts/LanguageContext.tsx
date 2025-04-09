import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'he';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<string, Record<string, string>> = {
  // Common UI elements
  'add': {
    en: 'Add',
    he: 'הוסף'
  },
  'delete': {
    en: 'Delete',
    he: 'מחק'
  },
  'save': {
    en: 'Save',
    he: 'שמור'
  },
  'cancel': {
    en: 'Cancel',
    he: 'בטל'
  },
  // Navigation
  'dashboard': {
    en: 'Dashboard',
    he: 'לוח בקרה'
  },
  'calendar': {
    en: 'Calendar',
    he: 'יומן'
  },
  'clock': {
    en: 'Smart Clock',
    he: 'שעון חכם'
  },
  'tasks': {
    en: 'Task Ladder',
    he: 'סולם משימות'
  },
  'process': {
    en: 'Process Map',
    he: 'מפת תהליכים'
  },
  'delegation': {
    en: 'Delegation',
    he: 'האצלה'
  },
  'rest': {
    en: 'BellRest',
    he: 'מרחב מנוחה'
  },
  'identity': {
    en: 'Identity Core',
    he: 'ליבת זהות'
  },
  'pomodoro': {
    en: 'Pomodoro Timer',
    he: 'טיימר פומודורו'
  },
  // Other UI elements can be added as needed
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  isRTL: false,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const isRTL = language === 'he';

  useEffect(() => {
    // Apply RTL class to body when Hebrew is selected
    if (isRTL) {
      document.body.classList.add('rtl');
      document.dir = 'rtl';
    } else {
      document.body.classList.remove('rtl');
      document.dir = 'ltr';
    }
  }, [isRTL]);

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
