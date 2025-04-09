
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-toggle">
      <button 
        className={`${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button 
        className={`font-miriam ${language === 'he' ? 'active' : ''}`}
        onClick={() => setLanguage('he')}
        aria-label="Switch to Hebrew"
      >
        עברית
      </button>
    </div>
  );
};

export default LanguageToggle;
