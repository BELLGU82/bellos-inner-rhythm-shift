
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { NeumorphCard } from '@/components/NeumorphCard';
import { NeumorphButton } from '@/components/NeumorphButton';
import { cn } from '@/lib/utils';
import { CheckCircle, Globe, Palette, Circle, Activity, Shield, Bot } from 'lucide-react';

type Theme = 'light' | 'dark';
type AdhdMode = 'normal' | 'reduced';
type AnimationMode = 'enabled' | 'disabled';
type GptTone = 'direct' | 'coaching' | 'cheerful';
type GptBehavior = 'suggestive' | 'passive' | 'active';
type GptMemory = 'enabled' | 'paused' | 'clear';

const Settings: React.FC = () => {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const [theme, setTheme] = useState<Theme>('light');
  const [adhdMode, setAdhdMode] = useState<AdhdMode>('normal');
  const [animationMode, setAnimationMode] = useState<AnimationMode>('enabled');
  const [gptTone, setGptTone] = useState<GptTone>('direct');
  const [gptBehavior, setGptBehavior] = useState<GptBehavior>('suggestive');
  const [gptMemory, setGptMemory] = useState<GptMemory>('enabled');
  
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your personal history? This action cannot be undone.')) {
      console.log('Clearing user history...');
      // In a real implementation, this would clear user data
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">{t('settings')}</h1>
      
      <div className="space-y-8">
        {/* Language Settings */}
        <NeumorphCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-bell-primary" />
            <h2 className="text-xl font-semibold">Language</h2>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                "px-4 py-2 rounded-xl transition-colors relative",
                language === 'en' ? "bg-bell-primary text-white" : "bg-bell-subtle"
              )}
            >
              English
              {language === 'en' && (
                <CheckCircle className="absolute top-1 right-1 w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={() => setLanguage('he')}
              className={cn(
                "px-4 py-2 rounded-xl transition-colors relative",
                language === 'he' ? "bg-bell-primary text-white" : "bg-bell-subtle"
              )}
            >
              עברית
              {language === 'he' && (
                <CheckCircle className="absolute top-1 right-1 w-4 h-4" />
              )}
            </button>
          </div>
        </NeumorphCard>
        
        {/* Theme Settings */}
        <NeumorphCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-6 h-6 text-bell-primary" />
            <h2 className="text-xl font-semibold">Theme Settings</h2>
          </div>
          
          <div className="space-y-6">
            {/* Light/Dark Mode */}
            <div>
              <h3 className="text-lg font-medium mb-3">Appearance</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl border-2 transition-colors flex justify-center items-center gap-2",
                    theme === 'light' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  <Circle className={cn("w-4 h-4", theme === 'light' ? "text-bell-primary" : "text-bell-muted")} />
                  <span>Light Mode</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl border-2 transition-colors flex justify-center items-center gap-2",
                    theme === 'dark' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  <Circle className={cn("w-4 h-4", theme === 'dark' ? "text-bell-primary" : "text-bell-muted")} />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>
            
            {/* ADHD Mode */}
            <div>
              <h3 className="text-lg font-medium mb-2">ADHD Mode</h3>
              <p className="text-bell-muted text-sm mb-3">
                Extra white space, reduced visual noise, and simplified interactions.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAdhdMode('normal')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    adhdMode === 'normal' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Standard
                </button>
                
                <button
                  onClick={() => setAdhdMode('reduced')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    adhdMode === 'reduced' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  ADHD-Friendly
                </button>
              </div>
            </div>
            
            {/* Animation Toggle */}
            <div>
              <h3 className="text-lg font-medium mb-2">Animations</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setAnimationMode('enabled')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    animationMode === 'enabled' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Enabled
                </button>
                
                <button
                  onClick={() => setAnimationMode('disabled')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    animationMode === 'disabled' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Disabled
                </button>
              </div>
            </div>
          </div>
        </NeumorphCard>
        
        {/* Privacy Settings */}
        <NeumorphCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-bell-primary" />
            <h2 className="text-xl font-semibold">Privacy Settings</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-bell-muted">
              Your data is stored locally on your device and never shared with third parties.
              You have full control over your information.
            </p>
            
            <NeumorphButton
              onClick={handleClearHistory}
              className="bg-red-50 text-red-500 hover:bg-red-100"
            >
              Clear Personal History
            </NeumorphButton>
          </div>
        </NeumorphCard>
        
        {/* BellGPT Preferences */}
        <NeumorphCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-6 h-6 text-bell-primary" />
            <h2 className="text-xl font-semibold">BellGPT Preferences</h2>
          </div>
          
          <div className="space-y-6">
            {/* Tone */}
            <div>
              <h3 className="text-lg font-medium mb-3">Tone</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setGptTone('direct')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    gptTone === 'direct' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Direct
                </button>
                
                <button
                  onClick={() => setGptTone('coaching')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    gptTone === 'coaching' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Coaching
                </button>
                
                <button
                  onClick={() => setGptTone('cheerful')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    gptTone === 'cheerful' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Cheerful
                </button>
              </div>
            </div>
            
            {/* Memory */}
            <div>
              <h3 className="text-lg font-medium mb-3">Memory</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setGptMemory('enabled')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    gptMemory === 'enabled' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Enable
                </button>
                
                <button
                  onClick={() => setGptMemory('paused')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    gptMemory === 'paused' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Pause
                </button>
                
                <button
                  onClick={() => setGptMemory('clear')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    gptMemory === 'clear' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Behavior */}
            <div>
              <h3 className="text-lg font-medium mb-3">Behavior</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setGptBehavior('suggestive')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    gptBehavior === 'suggestive' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Suggestive
                </button>
                
                <button
                  onClick={() => setGptBehavior('passive')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    gptBehavior === 'passive' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Passive
                </button>
                
                <button
                  onClick={() => setGptBehavior('active')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border-2 transition-colors",
                    gptBehavior === 'active' ? "border-bell-primary" : "border-bell-muted"
                  )}
                >
                  Active
                </button>
              </div>
            </div>
          </div>
        </NeumorphCard>
      </div>
    </div>
  );
};

export default Settings;
