import React, { useState } from 'react';
import NeumorphCard from '@/components/NeumorphCard';
import NeumorphButton from '@/components/NeumorphButton';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Zap, Battery, Brain } from 'lucide-react';

// Sample data for the calendar
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({
  length: 12
}, (_, i) => i + 8); // 8 AM to 7 PM

type EventType = {
  id: number;
  title: string;
  time: string;
  duration: number; // in hours
  energyLevel: 'high' | 'medium' | 'low';
  type: 'meeting' | 'focus' | 'admin' | 'rest';
  hour: number;
};
const sampleEvents: EventType[] = [{
  id: 1,
  title: 'Team Meeting',
  time: '9:00 AM',
  duration: 1,
  energyLevel: 'high',
  type: 'meeting',
  hour: 9
}, {
  id: 2,
  title: 'Strategic Planning',
  time: '11:00 AM',
  duration: 2,
  energyLevel: 'high',
  type: 'focus',
  hour: 11
}, {
  id: 3,
  title: 'Email & Admin',
  time: '2:00 PM',
  duration: 1,
  energyLevel: 'low',
  type: 'admin',
  hour: 14
}, {
  id: 4,
  title: 'Product Development',
  time: '3:30 PM',
  duration: 2.5,
  energyLevel: 'medium',
  type: 'focus',
  hour: 15
}, {
  id: 5,
  title: 'Mindfulness Break',
  time: '6:00 PM',
  duration: 0.5,
  energyLevel: 'medium',
  type: 'rest',
  hour: 18
}];
const Bellendar = () => {
  const [currentMonth] = useState('April');
  const [currentYear] = useState(2025);
  const [selectedDay, setSelectedDay] = useState(9);
  const [currentDate] = useState(new Date());
  const [energyMeter] = useState(70); // 0-100 scale for cognitive energy

  // Generate days for the current month view
  const days = Array.from({
    length: 31
  }, (_, i) => i + 1);

  // Get events for the selected day
  const eventsForDay = sampleEvents;
  const getEventTypeColor = (type: EventType['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-700';
      case 'focus':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-gray-100 text-gray-700';
      case 'rest':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  const getEnergyLevelIcon = (level: EventType['energyLevel']) => {
    switch (level) {
      case 'high':
        return <Zap size={16} className="text-amber-500" />;
      case 'medium':
        return <Battery size={16} className="text-blue-500" />;
      case 'low':
        return <Battery size={16} className="text-gray-500" />;
      default:
        return <Battery size={16} className="text-gray-500" />;
    }
  };
  return <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="neumorph-sm p-2 rounded-full">
            <CalendarIcon size={24} className="text-bell-primary" />
          </div>
          <h2 className="text-2xl font-medium">Bellendar</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <NeumorphButton size="sm" icon={<ChevronLeft size={16} />} className="rounded-full p-2 h-10 w-10" aria-label="Previous Month" />
          <div className="neumorph-inner px-4 py-2 rounded-xl">
            <span className="font-medium">{currentMonth} {currentYear}</span>
          </div>
          <NeumorphButton size="sm" icon={<ChevronRight size={16} />} className="rounded-full p-2 h-10 w-10" aria-label="Next Month" />
        </div>
        
        <NeumorphButton variant="primary" icon={<Plus size={16} />}>
          New Event
        </NeumorphButton>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Calendar */}
        <div>
          <NeumorphCard className="animate-fade-in">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {DAYS.map(day => <div key={day} className="text-center font-medium text-bell-muted text-sm py-2">
                  {day}
                </div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {days.map(day => <button key={day} className={`
                    h-10 w-full rounded-lg flex items-center justify-center
                    ${day === selectedDay ? 'neumorph-inner bg-bell-primary bg-opacity-10 text-bell-primary font-medium' : 'hover:bg-bell-subtle'}
                    ${day === currentDate.getDate() ? 'font-bold' : ''}
                  `} onClick={() => setSelectedDay(day)}>
                  {day}
                </button>)}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Energy Meter</h3>
              <div className="neumorph-inner p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <Brain size={18} className="text-bell-primary mr-2" />
                  <span className="text-sm font-medium">Cognitive Load</span>
                  <span className="ml-auto font-bold">{energyMeter}%</span>
                </div>
                <div className="h-2 bg-bell-subtle rounded-full overflow-hidden">
                  <div className="h-full bg-bell-primary rounded-full" style={{
                  width: `${energyMeter}%`
                }}></div>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-green-100 text-green-700">Morning Peak</div>
                  <div className="p-2 rounded bg-amber-100 text-amber-700">Afternoon Dip</div>
                  <div className="p-2 rounded bg-blue-100 text-blue-700">Evening Flow</div>
                </div>
              </div>
            </div>
          </NeumorphCard>
        </div>
        
        {/* Middle and Right Column - Day View and Tasks */}
        <div className="lg:col-span-2">
          <NeumorphCard title={`April ${selectedDay}, ${currentYear}`} className="animate-fade-in h-full">
            <div className="relative">
              {HOURS.map(hour => <div key={hour} className="flex items-start mb-6">
                  <div className="w-16 text-bell-muted text-sm pt-1">
                    {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>
                  <div className="flex-1 min-h-[60px] border-t border-bell-subtle pt-1">
                    {eventsForDay.filter(event => event.hour === hour).map(event => <div key={event.id} className={`mb-2 p-3 rounded-lg ${getEventTypeColor(event.type)}`} style={{
                  height: `${event.duration * 50}px`
                }}>
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{event.title}</h4>
                            {getEnergyLevelIcon(event.energyLevel)}
                          </div>
                          <div className="flex items-center text-xs mt-1">
                            <Clock size={12} className="mr-1" />
                            <span>{event.time} • {event.duration}h</span>
                          </div>
                        </div>)}
                  </div>
                </div>)}
            </div>
          </NeumorphCard>
        </div>
      </div>
    </div>;
};
export default Bellendar;