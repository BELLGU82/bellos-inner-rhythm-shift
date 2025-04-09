import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import NeumorphCard from '@/components/NeumorphCard';
import NeumorphButton from '@/components/NeumorphButton';
import ProgressRing from '@/components/ProgressRing';
import AddReminderDialog from '@/components/AddReminderDialog';
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
const breathingPrompts = [
  "Take a deep breath - you're exactly where you need to be right now.",
  "Notice how you're feeling. You don't need to change it, just acknowledge it.",
  "You don't need to finish everything — just move forward 5%.",
  "Your attention is your most valuable resource. Where do you want to place it now?",
  "Want to take a breath before we continue?"
];

// Hebrew breathing prompts
const hebrewBreathingPrompts = [
  "קחי נשימה עמוקה - את בדיוק במקום שבו את צריכה להיות.",
  "שימי לב איך את מרגישה. אין צורך לשנות, רק להכיר בכך.",
  "אין צורך לסיים הכל - רק להתקדם ב-5%.",
  "תשומת הלב שלך היא המשאב היקר ביותר. איפה את רוצה למקם אותה עכשיו?",
  "רוצה לקחת נשימה לפני שממשיכים?"
];

const speechRecognitionMock = {
  start: () => console.log('Speech recognition started'),
  stop: () => console.log('Speech recognition stopped'),
  onresult: null as any,
  onerror: null as any
};

const SmartClock = () => {
  const { t, isRTL, language } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeReminders, setActiveReminders] = useState<ReminderType[]>(sampleReminders);
  const [breathingPrompt, setBreathingPrompt] = useState('');
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [notification, setNotification] = useState<{ message: string; isError?: boolean } | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const nextReminderId = useRef(activeReminders.length > 0 ? Math.max(...activeReminders.map(r => r.id)) + 1 : 1);
  
  // Initialize speech recognition if available
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = language === 'he' ? 'he-IL' : 'en-US';
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(transcript);
        processVoiceCommand(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        showNotification(language === 'he' ? 'שגיאה בזיהוי קולי. נסי שוב.' : 'Voice recognition error. Please try again.', true);
      };
    } else {
      recognitionRef.current = speechRecognitionMock;
    }
  }, [language]);
  
  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Set breathing prompt based on language
    const prompts = language === 'he' ? hebrewBreathingPrompts : breathingPrompts;
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setBreathingPrompt(prompts[randomIndex]);

    return () => clearInterval(timer);
  }, [language]);
  
  // Check for reminders that need notification
  useEffect(() => {
    const checkForDueReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      activeReminders.forEach(reminder => {
        if (reminder.completed) return;
        
        const [time, period] = reminder.time.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        // Convert to 24 hour format if needed
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        if (hours === currentHour && minutes === currentMinute) {
          // This reminder is due now
          showNotification(`${language === 'he' ? 'תזכורת: ' : 'Reminder: '} ${reminder.title}`);
          
          // Optional: Play a sound
          const audio = new Audio('/notification-sound.mp3'); // Add a notification sound file to your public folder
          audio.play().catch(err => console.error('Could not play notification sound', err));
        }
      });
    };
    
    // Check every minute
    const intervalId = setInterval(checkForDueReminders, 60000);
    
    return () => clearInterval(intervalId);
  }, [activeReminders, language]);
  
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
    setActiveReminders(prev => prev.map(reminder => 
      reminder.id === id ? {
        ...reminder,
        completed: !reminder.completed
      } : reminder
    ));
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
        return <AlarmClock size={16} className="text-green-500" />;
      case 'anchor':
        return <Calendar size={16} className="text-amber-500" />;
      default:
        return <Bell size={16} />;
    }
  };
  
  const addReminder = (reminder: { time: string; title: string; type: ReminderType['type'] }) => {
    const newReminder: ReminderType = {
      id: nextReminderId.current,
      time: reminder.time,
      title: reminder.title,
      type: reminder.type,
      completed: false,
      expanded: false
    };
    
    nextReminderId.current += 1;
    setActiveReminders(prev => [...prev, newReminder]);
    showNotification(language === 'he' ? 'התזכורת נוספה בהצלחה' : 'Reminder added successfully');
  };
  
  const startVoiceRecognition = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setVoiceText('');
      showNotification(language === 'he' ? 'מקשיב... אמרי "הוסף תזכורת" או "תזכיר לי ל..."' : 'Listening... Say "Add reminder" or "Remind me to..."');
    } catch (error) {
      console.error('Error starting voice recognition', error);
      setIsListening(false);
      showNotification(language === 'he' ? 'לא ניתן להפעיל זיהוי קולי' : 'Could not start voice recognition', true);
    }
  };
  
  const processVoiceCommand = (text: string) => {
    // Simple voice command processing
    const lowerText = text.toLowerCase();
    const reminderKeywords = language === 'he' 
      ? ['תזכיר לי', 'תזכורת', 'הוסף תזכורת'] 
      : ['remind me', 'add reminder', 'set reminder'];
      
    const hasReminderKeyword = reminderKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
    
    if (hasReminderKeyword) {
      // Extract what to remember
      let reminderText = text;
      
      // Try to extract the task from "remind me to..." pattern
      if (language === 'he') {
        const match = text.match(/תזכיר לי ל(.+)/i) || text.match(/תזכורת ל(.+)/i);
        if (match && match[1]) {
          reminderText = match[1].trim();
        }
      } else {
        const match = text.match(/remind me to (.+)/i) || text.match(/set reminder to (.+)/i);
        if (match && match[1]) {
          reminderText = match[1].trim();
        }
      }
      
      // Calculate a time 30 minutes from now
      const reminderTime = new Date();
      reminderTime.setMinutes(reminderTime.getMinutes() + 30);
      
      // Format as "HH:MM AM/PM"
      const formattedTime = reminderTime.toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: language !== 'he'
      });
      
      addReminder({
        title: reminderText,
        time: formattedTime,
        type: 'task'
      });
    } else {
      showNotification(language === 'he' ? 'לא הבנתי את הפקודה. נסי "תזכיר לי ל..."' : 'Command not recognized. Try "Remind me to..."', true);
    }
  };
  
  const showNotification = (message: string, isError = false) => {
    setNotification({ message, isError });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  const isAnyReminderExpanded = activeReminders.some(r => r.expanded);
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 bell-breathing-container ${isRTL ? 'rtl' : ''}`}>
      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg max-w-xs animate-fade-in
          ${notification.isError ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'}`}
        >
          <div className="flex items-center">
            {notification.isError ? (
              <X size={18} className="text-red-500 mr-2" />
            ) : (
              <Check size={18} className="text-green-500 mr-2" />
            )}
            <span className={language === 'he' ? 'font-miriam' : 'font-mono'}>
              {notification.message}
            </span>
          </div>
        </div>
      )}
      
      {/* Left Column - Clock */}
      <div className="space-y-8">
        <NeumorphCard className="animate-fade-in p-8">
          <div className="flex flex-col items-center">
            <div className="neumorph-sm rounded-full p-8 mb-6">
              <ProgressRing 
                progress={Math.round((currentTime.getHours() % 12) / 12 * 100)} 
                size={200} 
                color="#F88AB0" 
                backgroundColor="#e2e8f0"
              >
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
            
            <div className="neumorph-inner p-4 rounded-xl w-full">
              <div className="flex items-center mb-4">
                <Mic size={18} className={`${isListening ? 'text-red-500 animate-pulse' : 'text-bell-primary'} mr-2`} />
                <span className={`font-medium ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? 'עוזר קולי' : 'Voice Assistant'}
                </span>
              </div>
              <button 
                className={`bell-primary-btn w-full ${isListening ? 'animate-pulse bg-red-100' : ''}`}
                onClick={startVoiceRecognition}
              >
                {isListening 
                  ? (language === 'he' ? 'מקשיב...' : 'Listening...') 
                  : (language === 'he' ? '"היי בל, תזכיר לי ל..."' : '"Hey Bell, remind me to..."')}
              </button>
              
              {voiceText && (
                <div className="mt-3 p-2 neumorph-inner rounded-lg text-sm">
                  <div className="text-bell-muted mb-1">
                    {language === 'he' ? 'שמעתי:' : 'I heard:'}
                  </div>
                  <div className={language === 'he' ? 'font-miriam' : 'font-mono'}>
                    "{voiceText}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </NeumorphCard>
      </div>
      
      {/* Middle and Right Column - Reminders */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl">
            <Clock size={24} className="text-bell-primary" />
            {language === 'he' ? 'שעון תזכורות חכם' : 'Smart Reminder Clock'}
          </h2>
          <NeumorphButton 
            variant="primary" 
            icon={<Plus size={16} />} 
            className="bell-primary-btn text-gray-400"
            onClick={() => setIsAddReminderOpen(true)}
          >
            {language === 'he' ? 'תזכורת חדשה' : 'New Reminder'}
          </NeumorphButton>
        </div>
        
        {/* Cognitive grounding zone */}
        <div className="bell-breather">
          <p className={language === 'he' ? 'font-miriam' : 'font-mono'}>
            {breathingPrompt}
          </p>
        </div>
        
        <NeumorphCard className="animate-fade-in">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-bell-subtle">
              <h3 className={`font-semibold ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                {language === 'he' ? 'תזכורות להיום' : 'Today\'s Reminders'}
              </h3>
              <div className={`text-bell-muted text-sm ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                {activeReminders.filter(r => r.completed).length}/{activeReminders.length} 
                {language === 'he' ? ' הושלמו' : ' Completed'}
              </div>
            </div>
            
            {activeReminders.map(reminder => (
              <div 
                key={reminder.id} 
                className={`
                  bell-task-card
                  ${reminder.expanded ? 'expanded' : ''}
                  ${isAnyReminderExpanded && !reminder.expanded ? 'faded' : ''}
                `} 
                onClick={() => toggleReminderExpansion(reminder.id)}
              >
                <div className="flex items-center justify-between my-[31px] py-[4px] px-[18px] mx-[12px]">
                  <div className="flex items-center mx-0 py-0 my-5 px-px">
                    <button 
                      className={`
                        h-6 w-6 rounded-full mr-3 flex items-center justify-center
                        ${reminder.completed ? 'bg-bell-primary text-white' : 'neumorph-sm'}
                      `} 
                      onClick={e => {
                        e.stopPropagation();
                        toggleReminderCompletion(reminder.id);
                      }}
                    >
                      {reminder.completed && <Check size={14} />}
                    </button>
                    
                    <div className="px-[22px]">
                      <div className="flex items-center">
                        {getReminderTypeIcon(reminder.type)}
                        <span className={`font-medium ml-2 ${reminder.completed ? 'line-through text-bell-muted' : ''} ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                          {reminder.title}
                        </span>
                      </div>
                      <div className={`text-bell-muted text-sm mt-1 ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>{reminder.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {reminder.expanded ? (
                      <button 
                        className="bell-outline-icon" 
                        onClick={e => {
                          e.stopPropagation();
                          toggleReminderExpansion(reminder.id);
                        }}
                      >
                        <X size={18} className="text-bell-muted hover:text-bell-primary" />
                      </button>
                    ) : (
                      <button 
                        className="p-2 rounded-full hover:bg-bell-subtle transition-colors" 
                        onClick={e => {
                          e.stopPropagation();
                          deleteReminder(reminder.id);
                        }}
                      >
                        <Trash2 size={16} className="text-bell-muted hover:text-bell-primary" />
                      </button>
                    )}
                  </div>
                </div>
                
                {reminder.expanded && (
                  <div className="mt-4 pt-4 border-t border-bell-subtle animate-fade-in">
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                      <div className="p-3 bell-emotion-card">
                        <h4 className="font-medium mb-2">
                          {language === 'he' ? 'פרטי תזכורת' : 'Reminder Details'}
                        </h4>
                        <p className="text-sm text-bell-foreground/80">
                          {language === 'he' ? 'הערות נוספות יופיעו כאן' : 'Additional notes would appear here'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button className="bell-secondary-btn flex items-center justify-center gap-2">
                          <Calendar size={16} />
                          {language === 'he' ? 'תזמן מחדש' : 'Reschedule'}
                        </button>
                        <button className="bell-secondary-btn flex items-center justify-center gap-2">
                          <Bell size={16} />
                          {language === 'he' ? 'הוסף תזכורת' : 'Add Reminder'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {activeReminders.length === 0 && (
              <div className={`text-center py-8 text-bell-muted ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                <Clock size={48} className="mx-auto mb-4 opacity-30" />
                <p>{language === 'he' ? 'אין תזכורות להיום' : 'No reminders set for today'}</p>
                <NeumorphButton 
                  variant="outlined" 
                  icon={<Plus size={16} />} 
                  className="mt-4"
                  onClick={() => setIsAddReminderOpen(true)}
                >
                  {language === 'he' ? 'הוסף תזכורת ראשונה' : 'Add Your First Reminder'}
                </NeumorphButton>
              </div>
            )}
          </div>
        </NeumorphCard>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NeumorphCard 
            title={language === 'he' ? 'עוגני יום' : 'Daily Anchors'} 
            className="animate-fade-in" 
            style={{ animationDelay: '0.1s' }}
          >
            <div className="neumorph-inner p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-bell-primary rounded-full mr-2"></div>
                  <span className={language === 'he' ? 'font-miriam' : 'font-mono'}>
                    {language === 'he' ? 'טקס בוקר' : 'Morning Ritual'}
                  </span>
                </div>
                <span className={`text-bell-muted text-sm ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? '8:00' : '8:00 AM'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-bell-secondary rounded-full mr-2"></div>
                  <span className={language === 'he' ? 'font-miriam' : 'font-mono'}>
                    {language === 'he' ? 'התייעצות צוות' : 'Team Huddle'}
                  </span>
                </div>
                <span className={`text-bell-muted text-sm ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? '10:30' : '10:30 AM'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                  <span className={language === 'he' ? 'font-miriam' : 'font-mono'}>
                    {language === 'he' ? 'זמן תכנון' : 'Planning Block'}
                  </span>
                </div>
                <span className={`text-bell-muted text-sm ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? '14:00' : '2:00 PM'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-amber-500 rounded-full mr-2"></div>
                  <span className={language === 'he' ? 'font-miriam' : 'font-mono'}>
                    {language === 'he' ? 'סיכום יום' : 'Day Review'}
                  </span>
                </div>
                <span className={`text-bell-muted text-sm ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? '17:30' : '5:30 PM'}
                </span>
              </div>
            </div>
          </NeumorphCard>
          
          <NeumorphCard 
            title={language === 'he' ? 'תזכורות מיינדסט' : 'Mindset Pings'} 
            className="animate-fade-in" 
            style={{ animationDelay: '0.2s' }}
          >
            <div className="neumorph-inner p-4 rounded-xl space-y-3">
              <div className="bell-insight-card">
                <div className={`text-sm font-medium text-bell-primary mb-1 ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? 'עצירה אסטרטגית' : 'Strategic Pause'}
                </div>
                <p className={`text-xs text-bell-foreground ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? 'מה המהלך בעל הערך הגבוה ביותר כרגע?' : 'What\'s the highest leverage move right now?'}
                </p>
              </div>
              
              <div className="bell-insight-card">
                <div className={`text-sm font-medium text-bell-primary mb-1 ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? 'מיינדסט של מנכ״לית' : 'CEO Mindset'}
                </div>
                <p className={`text-xs text-bell-foreground ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? 'האם אני מחליטה מתוך שפע?' : 'Am I making decisions from abundance?'}
                </p>
              </div>
              
              <div className="bell-insight-card">
                <div className={`text-sm font-medium text-bell-primary mb-1 ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? 'בדיקת אנרגיה' : 'Energy Check'}
                </div>
                <p className={`text-xs text-bell-foreground ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                  {language === 'he' ? 'מה רמת האנרגיה שלי? האם אני צריכה איפוס?' : 'How\'s my energy level? Need a reset?'}
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-right">
              <NeumorphButton 
                size="sm" 
                icon={<Plus size={14} />} 
                className="bell-secondary-btn"
              >
                {language === 'he' ? 'הוסף תזכורת' : 'Add Ping'}
              </NeumorphButton>
            </div>
          </NeumorphCard>
        </div>
      </div>
      
      {/* Add Reminder Dialog */}
      <AddReminderDialog
        isOpen={isAddReminderOpen}
        onClose={() => setIsAddReminderOpen(false)}
        onAddReminder={reminder => {
          addReminder(reminder);
          setIsAddReminderOpen(false);
        }}
      />
    </div>
  );
};

export default SmartClock;