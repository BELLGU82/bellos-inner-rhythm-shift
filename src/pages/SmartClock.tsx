
import React, { useState, useEffect } from 'react';
import NeumorphCard from '@/components/NeumorphCard';
import NeumorphButton from '@/components/NeumorphButton';
import ProgressRing from '@/components/ProgressRing';
import { 
  Clock, 
  Bell, 
  Plus, 
  Trash2, 
  Check, 
  Mic, 
  AlarmClock, 
  Calendar,
  Sparkles 
} from 'lucide-react';

type ReminderType = {
  id: number;
  time: string;
  title: string;
  type: 'mindset' | 'task' | 'recovery' | 'anchor';
  completed: boolean;
};

const sampleReminders: ReminderType[] = [
  { id: 1, time: '08:00 AM', title: 'Morning mindset ritual', type: 'mindset', completed: true },
  { id: 2, time: '10:30 AM', title: 'Strategic planning block', type: 'task', completed: false },
  { id: 3, time: '12:00 PM', title: 'Midday movement break', type: 'recovery', completed: false },
  { id: 4, time: '03:00 PM', title: 'Team alignment session', type: 'anchor', completed: false },
  { id: 5, time: '05:30 PM', title: 'Daily review & tomorrow prep', type: 'mindset', completed: false },
];

const SmartClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeReminders, setActiveReminders] = useState<ReminderType[]>(sampleReminders);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const toggleReminderCompletion = (id: number) => {
    setActiveReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, completed: !reminder.completed } 
          : reminder
      )
    );
  };
  
  const deleteReminder = (id: number) => {
    setActiveReminders(prev => prev.filter(reminder => reminder.id !== id));
  };
  
  const getReminderTypeIcon = (type: ReminderType['type']) => {
    switch (type) {
      case 'mindset': return <Sparkles size={16} className="text-purple-500" />;
      case 'task': return <Check size={16} className="text-blue-500" />;
      case 'recovery': return <AlarmClock size={16} className="text-green-500" />;
      case 'anchor': return <Calendar size={16} className="text-amber-500" />;
      default: return <Bell size={16} />;
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Clock */}
      <div className="space-y-8">
        <NeumorphCard className="animate-fade-in p-8">
          <div className="flex flex-col items-center">
            <div className="neumorph-sm rounded-full p-8 mb-6">
              <ProgressRing 
                progress={Math.round((currentTime.getHours() % 12) / 12 * 100)} 
                size={200}
                color="#4a6fa5"
                backgroundColor="#e2e8f0"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">{formatTime(currentTime)}</div>
                  <div className="text-bell-muted">{formatDate(currentTime)}</div>
                </div>
              </ProgressRing>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <button className="neumorph-btn p-4 rounded-xl text-center">
                <AlarmClock size={24} className="mx-auto mb-2 text-bell-primary" />
                <span className="text-sm">Set Alarm</span>
              </button>
              <button className="neumorph-btn p-4 rounded-xl text-center">
                <Bell size={24} className="mx-auto mb-2 text-bell-primary" />
                <span className="text-sm">Notifications</span>
              </button>
            </div>
            
            <div className="neumorph-inner p-4 rounded-xl w-full">
              <div className="flex items-center mb-4">
                <Mic size={18} className="text-bell-primary mr-2" />
                <span className="font-medium">Voice Assistant</span>
              </div>
              <button className="bg-bell-primary text-white rounded-lg p-3 w-full hover:bg-opacity-90 transition-colors">
                "Hey Bell, remind me to..."
              </button>
            </div>
          </div>
        </NeumorphCard>
      </div>
      
      {/* Middle and Right Column - Reminders */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock size={24} className="text-bell-primary" />
            Smart Reminder Clock
          </h2>
          <NeumorphButton 
            variant="primary" 
            icon={<Plus size={16} />}
          >
            New Reminder
          </NeumorphButton>
        </div>
        
        <NeumorphCard className="animate-fade-in">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-bell-subtle">
              <h3 className="font-semibold">Today's Reminders</h3>
              <div className="text-bell-muted text-sm">
                {activeReminders.filter(r => r.completed).length}/{activeReminders.length} Completed
              </div>
            </div>
            
            {activeReminders.map(reminder => (
              <div 
                key={reminder.id} 
                className={`
                  neumorph-inner p-4 rounded-xl flex items-center justify-between
                  ${reminder.completed ? 'bg-opacity-60' : ''}
                `}
              >
                <div className="flex items-center">
                  <button 
                    className={`
                      h-6 w-6 rounded-full mr-3 flex items-center justify-center
                      ${reminder.completed ? 'bg-bell-primary text-white' : 'neumorph-sm'}
                    `}
                    onClick={() => toggleReminderCompletion(reminder.id)}
                  >
                    {reminder.completed && <Check size={14} />}
                  </button>
                  
                  <div>
                    <div className="flex items-center">
                      {getReminderTypeIcon(reminder.type)}
                      <span className={`font-medium ml-2 ${reminder.completed ? 'line-through text-bell-muted' : ''}`}>
                        {reminder.title}
                      </span>
                    </div>
                    <div className="text-bell-muted text-sm mt-1">{reminder.time}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 rounded-full hover:bg-bell-subtle transition-colors"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    <Trash2 size={16} className="text-bell-muted" />
                  </button>
                </div>
              </div>
            ))}
            
            {activeReminders.length === 0 && (
              <div className="text-center py-8 text-bell-muted">
                <Clock size={48} className="mx-auto mb-4 opacity-30" />
                <p>No reminders set for today</p>
                <NeumorphButton 
                  variant="outlined" 
                  icon={<Plus size={16} />}
                  className="mt-4"
                >
                  Add Your First Reminder
                </NeumorphButton>
              </div>
            )}
          </div>
        </NeumorphCard>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NeumorphCard title="Daily Anchors" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="neumorph-inner p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>Morning Ritual</span>
                </div>
                <span className="text-bell-muted text-sm">8:00 AM</span>
              </div>
              
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Team Huddle</span>
                </div>
                <span className="text-bell-muted text-sm">10:30 AM</span>
              </div>
              
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-purple-500 rounded-full mr-2"></div>
                  <span>Planning Block</span>
                </div>
                <span className="text-bell-muted text-sm">2:00 PM</span>
              </div>
              
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-amber-500 rounded-full mr-2"></div>
                  <span>Day Review</span>
                </div>
                <span className="text-bell-muted text-sm">5:30 PM</span>
              </div>
            </div>
          </NeumorphCard>
          
          <NeumorphCard title="Mindset Pings" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="neumorph-inner p-4 rounded-xl space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-sm font-medium text-purple-700 mb-1">Strategic Pause</div>
                <p className="text-xs text-purple-600">
                  What's the highest leverage move right now?
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-sm font-medium text-blue-700 mb-1">CEO Mindset</div>
                <p className="text-xs text-blue-600">
                  Am I making decisions from abundance?
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="text-sm font-medium text-green-700 mb-1">Energy Check</div>
                <p className="text-xs text-green-600">
                  How's my energy level? Need a reset?
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-right">
              <NeumorphButton size="sm" icon={<Plus size={14} />}>
                Add Ping
              </NeumorphButton>
            </div>
          </NeumorphCard>
        </div>
      </div>
    </div>
  );
};

export default SmartClock;
