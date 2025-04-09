import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import NeumorphCard from '@/components/NeumorphCard';
import NeumorphButton from '@/components/NeumorphButton';
import ProgressRing from '@/components/ProgressRing';
import { Clock, Bell, Plus, Trash2, Check, Mic, AlarmClock, Calendar, Sparkles, X } from 'lucide-react';
type ReminderType = {
  id: number;
  time: string;
  title: string;
  type: 'mindset' | 'task' | 'recovery' | 'anchor';
  completed: boolean;
  expanded?: boolean;
};
const sampleReminders: ReminderType[] = [{
  id: 1,
  time: '08:00 AM',
  title: 'Morning mindset ritual',
  type: 'mindset',
  completed: true,
  expanded: false
}, {
  id: 2,
  time: '10:30 AM',
  title: 'Strategic planning block',
  type: 'task',
  completed: false,
  expanded: false
}, {
  id: 3,
  time: '12:00 PM',
  title: 'Midday movement break',
  type: 'recovery',
  completed: false,
  expanded: false
}, {
  id: 4,
  time: '03:00 PM',
  title: 'Team alignment session',
  type: 'anchor',
  completed: false,
  expanded: false
}, {
  id: 5,
  time: '05:30 PM',
  title: 'Daily review & tomorrow prep',
  type: 'mindset',
  completed: false,
  expanded: false
}];

// Cognitive grounding quotes
const breathingPrompts = ["Take a deep breath - you're exactly where you need to be right now.", "Notice how you're feeling. You don't need to change it, just acknowledge it.", "You don't need to finish everything — just move forward 5%.", "Your attention is your most valuable resource. Where do you want to place it now?", "Want to take a breath before we continue?"];
const SmartClock = () => {
  const {
    t,
    isRTL,
    language
  } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeReminders, setActiveReminders] = useState<ReminderType[]>(sampleReminders);
  const [breathingPrompt, setBreathingPrompt] = useState(breathingPrompts[0]);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Randomly select a breathing prompt
    const randomIndex = Math.floor(Math.random() * breathingPrompts.length);
    setBreathingPrompt(breathingPrompts[randomIndex]);
    return () => clearInterval(timer);
  }, []);
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: language !== 'he'
    });
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const toggleReminderCompletion = (id: number) => {
    setActiveReminders(prev => prev.map(reminder => reminder.id === id ? {
      ...reminder,
      completed: !reminder.completed
    } : reminder));
  };
  const deleteReminder = (id: number) => {
    setActiveReminders(prev => prev.filter(reminder => reminder.id !== id));
  };
  const toggleReminderExpansion = (id: number) => {
    setActiveReminders(prev => prev.map(reminder => ({
      ...reminder,
      expanded: reminder.id === id ? !reminder.expanded : false
    })));
  };
  const getReminderTypeIcon = (type: ReminderType['type']) => {
    switch (type) {
      case 'mindset':
        return <Sparkles size={16} className="text-bell-primary" />;
      case 'task':
        return <Check size={16} className="text-bell-secondary" />;
      case 'recovery':
        return;
      case 'anchor':
        return <Calendar size={16} className="text-amber-500" />;
      default:
        return;
    }
  };
  const isAnyReminderExpanded = activeReminders.some(r => r.expanded);
  return <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 bell-breathing-container ${isRTL ? 'rtl' : ''}`}>
      {/* Left Column - Clock */}
      <div className="space-y-8">
        <NeumorphCard className="animate-fade-in p-8">
          <div className="flex flex-col items-center">
            <div className="neumorph-sm rounded-full p-8 mb-6">
              <ProgressRing progress={Math.round(currentTime.getHours() % 12 / 12 * 100)} size={200} color="#F88AB0" // Updated to primary color
            backgroundColor="#e2e8f0">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-1 ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                    {formatTime(currentTime)}
                  </div>
                  <div className={`text-bell-muted ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                    {formatDate(currentTime)}
                  </div>
                </div>
              </ProgressRing>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <button className="neumorph-btn p-4 rounded-xl text-center group">
                <AlarmClock size={24} className="mx-auto mb-2 text-bell-muted group-hover:text-bell-primary transition-colors" />
                <span className={`text-sm ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? 'הגדר התראה' : 'Set Alarm'}
                </span>
              </button>
              <button className="neumorph-btn p-4 rounded-xl text-center group">
                <Bell size={24} className="mx-auto mb-2 text-bell-muted group-hover:text-bell-primary transition-colors" />
                <span className={`text-sm ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? 'התראות' : 'Notifications'}
                </span>
              </button>
            </div>
            
            
          </div>
        </NeumorphCard>
      </div>
      
      {/* Middle and Right Column - Reminders */}
      
    </div>;
};
export default SmartClock;