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
  'documents': {
    en: 'Documents Vault',
    he: 'מאגר מסמכים'
  },
  'ritual': {
    en: 'CEO Ritual',
    he: 'ריטואל פתיחה יומי'
  },
  'growth': {
    en: 'Growth Log',
    he: 'יומן צמיחה'
  },
  'inbox': {
    en: 'Inbox',
    he: 'מצב איסוף'
  },
  'settings': {
    en: 'Settings',
    he: 'הגדרות'
  },
  'ask': {
    en: 'Ask BellGPT',
    he: 'שאל את BellGPT'
  },
  'send_to_inbox': {
    en: 'Send to Inbox',
    he: 'שלח לתיבת הדואר'
  },
  'act_now': {
    en: 'Act Now',
    he: 'פעל עכשיו'
  },
  'good_morning': {
    en: 'Good morning, Bell 💫 Your day starts now.',
    he: 'בוקר טוב, בל 💫 היום שלך מתחיל עכשיו.'
  },
  'focus_areas': {
    en: 'Focus Areas (3 max)',
    he: 'תחומי מיקוד (3 לכל היותר)'
  },
  'highest_roi': {
    en: 'Highest-ROI task of the day',
    he: 'משימה עם התשואה הגבוהה ביותר היום'
  },
  'not_doing': {
    en: "What I'm *not* doing today",
    he: 'מה שאני *לא* עושה היום'
  },
  'begin_ritual': {
    en: 'Begin Ritual',
    he: 'התחל טקס'
  },
  'creation': {
    en: 'Creation',
    he: 'יצירה'
  },
  'leadership': {
    en: 'Leadership',
    he: 'מנהיגות'
  },
  'stillness': {
    en: 'Stillness',
    he: 'שקט'
  },
  'welcome_back': {
    en: 'Welcome back',
    he: 'ברוך שובך'
  },
  // BellGPT translations
  'gpt_thinking': {
    en: 'Thinking...',
    he: 'חושב...'
  },
  'gpt_error': {
    en: 'Sorry, I couldn\'t process that request. Please try again.',
    he: 'מצטער, לא הצלחתי לעבד את הבקשה. נסה שוב בבקשה.'
  },
  'gpt_placeholder': {
    en: 'Ask me anything...',
    he: 'שאל אותי כל דבר...'
  },
  'convert_to_task': {
    en: 'Convert to Task',
    he: 'המר למשימה'
  },
  'save_as_insight': {
    en: 'Save as Insight',
    he: 'שמור כתובנה'
  },
  'add_to_calendar': {
    en: 'Add to Calendar',
    he: 'הוסף ליומן'
  },
  // Documents Vault translations
  'documents_vault': {
    en: 'Documents Vault',
    he: 'מאגר מסמכים'
  },
  'upload_files': {
    en: 'Drag and drop files here or click to browse',
    he: 'גרור ושחרר קבצים כאן או לחץ לעיון'
  },
  'supports_formats': {
    en: 'Supports all document and image formats',
    he: 'תומך בכל תבניות המסמכים והתמונות'
  },
  'search_documents': {
    en: 'Search documents...',
    he: 'חפש מסמכים...'
  },
  'enable_summary': {
    en: 'Enable Auto-Summary',
    he: 'הפעל סיכום אוטומטי'
  },
  'no_documents': {
    en: 'No documents found',
    he: 'לא נמצאו מסמכים'
  },
  'adjust_search': {
    en: 'Try adjusting your search or filters',
    he: 'נסה להתאים את החיפוש או המסננים שלך'
  },
  'upload_first': {
    en: 'Upload your first document to get started',
    he: 'העלה את המסמך הראשון שלך כדי להתחיל'
  },
  'view_document': {
    en: 'View document',
    he: 'צפה במסמך'
  },
  'assign_to_task': {
    en: 'Assign to task',
    he: 'הקצה למשימה'
  },
  'delete_document': {
    en: 'Delete document',
    he: 'מחק מסמך'
  },
  // Task Ladder translations
  'add_task': {
    en: 'Add Task',
    he: 'הוסף משימה'
  },
  'search_tasks': {
    en: 'Search tasks...',
    he: 'חפש משימות...'
  },
  'roi_task_ladder': {
    en: 'ROI Task Ladder',
    he: 'סולם משימות לפי תשואה'
  },
  'defer': {
    en: 'Defer',
    he: 'דחה'
  },
  'delegate': {
    en: 'Delegate',
    he: 'האצל'
  },
  'done': {
    en: 'Done',
    he: 'הושלם'
  },
  'restore': {
    en: 'Restore',
    he: 'שחזר'
  },
  'all': {
    en: 'All',
    he: 'הכל'
  },
  'new_task': {
    en: 'New Task',
    he: 'משימה חדשה'
  },
  'high': {
    en: 'High',
    he: 'גבוה'
  },
  'medium': {
    en: 'Medium',
    he: 'בינוני'
  },
  'low': {
    en: 'Low',
    he: 'נמוך'
  },
  'urgency': {
    en: 'Urgency',
    he: 'דחיפות'
  },
  'positive': {
    en: 'Positive',
    he: 'חיובי'
  },
  'neutral': {
    en: 'Neutral',
    he: 'ניטרלי'
  },
  'draining': {
    en: 'Draining',
    he: 'מתיש'
  },
  'title': {
    en: 'Title',
    he: 'כותרת'
  },
  'description': {
    en: 'Description',
    he: 'תיאור'
  },
  'time': {
    en: 'Time',
    he: 'זמן'
  },
  'emotion': {
    en: 'Emotion',
    he: 'רגש'
  },
  'delegated': {
    en: 'Delegated',
    he: 'הואצל'
  },
  'minutes': {
    en: 'minutes',
    he: 'דקות'
  },
  'title_required': {
    en: 'Title is required',
    he: 'נדרש להזין כותרת'
  },
  'task_added': {
    en: 'Task added successfully',
    he: 'המשימה נוספה בהצלחה'
  },
  'status_updated': {
    en: 'Status updated successfully',
    he: 'הסטטוס עודכן בהצלחה'
  },
  'confirm_defer': {
    en: 'Are you sure you want to defer this task?',
    he: 'האם אתה בטוח שברצונך לדחות משימה זו?'
  },
  'defer_explanation': {
    en: 'Deferred tasks will be moved to the bottom of your list.',
    he: 'משימות שנדחו יועברו לתחתית הרשימה שלך.'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  isRTL: false,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getSavedLanguage = (): Language => {
    const saved = localStorage.getItem('bellOS-language');
    return (saved === 'en' || saved === 'he') ? saved : 'en';
  };
  
  const [language, setLanguage] = useState<Language>(getSavedLanguage());
  const isRTL = language === 'he';

  useEffect(() => {
    localStorage.setItem('bellOS-language', language);
    
    if (isRTL) {
      document.body.classList.add('rtl');
      document.dir = 'rtl';
    } else {
      document.body.classList.remove('rtl');
      document.dir = 'ltr';
    }
  }, [isRTL, language]);

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
