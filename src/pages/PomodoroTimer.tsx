
import React, { useState, useEffect } from 'react';
import NeumorphCard from '@/components/NeumorphCard';
import NeumorphButton from '@/components/NeumorphButton';
import ProgressRing from '@/components/ProgressRing';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Timer, 
  BookOpen,
  Coffee
} from 'lucide-react';

const timerModes = [
  { id: 'short', label: 'Quick Sprint', duration: 15 * 60 }, // 15 minutes
  { id: 'standard', label: 'Standard Focus', duration: 25 * 60 }, // 25 minutes
  { id: 'deep', label: 'Deep Work', duration: 50 * 60 }, // 50 minutes
];

const quotes = [
  "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
  "Focus on being productive instead of busy.",
  "You don't need more hours in the day. You need a clearer focus.",
  "Time is what we want most, but what we use worst.",
  "The way to get started is to quit talking and begin doing.",
  "Don't watch the clock; do what it does. Keep going.",
];

const PomodoroTimer = () => {
  const [selectedMode, setSelectedMode] = useState(timerModes[1]); // Default to standard
  const [timeLeft, setTimeLeft] = useState(selectedMode.duration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
  
  // Set new quote when timer starts
  useEffect(() => {
    if (isActive && !isPaused) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }
  }, [isActive, isPaused]);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer completed
      setIsActive(false);
      setSessionsCompleted(prev => prev + 1);
      
      // Show break suggestion after 2 sessions
      if ((sessionsCompleted + 1) % 2 === 0) {
        setShowBreakSuggestion(true);
      }
      
      // Play sound if enabled
      if (soundOn) {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
        audio.play();
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft, soundOn, sessionsCompleted]);
  
  const toggleTimer = () => {
    if (timeLeft === 0) {
      // Reset timer if it's completed
      setTimeLeft(selectedMode.duration);
      setIsActive(true);
      setIsPaused(false);
    } else if (isActive) {
      // Pause the timer
      setIsPaused(true);
    } else {
      // Start or resume the timer
      setIsActive(true);
      setIsPaused(false);
    }
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(selectedMode.duration);
    setShowBreakSuggestion(false);
  };
  
  const changeMode = (mode: typeof timerModes[0]) => {
    setSelectedMode(mode);
    setTimeLeft(mode.duration);
    setIsActive(false);
    setIsPaused(false);
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const calculateProgress = (): number => {
    const total = selectedMode.duration;
    const remaining = timeLeft;
    const elapsed = total - remaining;
    return Math.round((elapsed / total) * 100);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Timer */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="neumorph-sm p-2 rounded-full">
              <Timer size={24} className="text-bell-primary" />
            </div>
            <h2 className="text-2xl font-bold">Custom Pomodoro</h2>
          </div>
          
          <div className="flex gap-2">
            <NeumorphButton 
              size="sm" 
              onClick={() => setSoundOn(!soundOn)}
              className="rounded-full p-2 h-10 w-10"
              aria-label={soundOn ? "Mute Sound" : "Enable Sound"}
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </NeumorphButton>
          </div>
        </div>
        
        <NeumorphCard className="animate-fade-in p-8">
          <div className="flex flex-col items-center">
            {/* Timer Mode Selection */}
            <div className="flex gap-3 mb-8">
              {timerModes.map(mode => (
                <NeumorphButton
                  key={mode.id}
                  className={`py-2 px-4 ${selectedMode.id === mode.id ? 'bg-bell-primary text-white' : ''}`}
                  onClick={() => changeMode(mode)}
                >
                  {mode.label}
                </NeumorphButton>
              ))}
            </div>
            
            {/* Quote Display */}
            <div className="neumorph-inner py-4 px-6 rounded-xl mb-8 text-center">
              <BookOpen size={20} className="text-bell-primary mb-2 mx-auto" />
              <p className="text-bell-foreground italic">"{currentQuote}"</p>
            </div>
            
            {/* Timer Display */}
            <div className="neumorph-sm rounded-full p-8 mb-6">
              <ProgressRing 
                progress={calculateProgress()} 
                size={240}
                color="#4a6fa5"
                backgroundColor="#e2e8f0"
              >
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{formatTime(timeLeft)}</div>
                  <div className="text-bell-muted">{selectedMode.label}</div>
                </div>
              </ProgressRing>
            </div>
            
            {/* Timer Controls */}
            <div className="flex gap-4 mt-4">
              <NeumorphButton 
                variant="primary" 
                size="lg" 
                className="w-40"
                onClick={toggleTimer}
                icon={isActive && !isPaused ? <Pause size={20} /> : <Play size={20} />}
              >
                {isActive && !isPaused ? 'Pause' : (isPaused ? 'Resume' : 'Start')}
              </NeumorphButton>
              
              <NeumorphButton 
                size="lg"
                onClick={resetTimer}
                icon={<RotateCcw size={20} />}
              >
                Reset
              </NeumorphButton>
            </div>
          </div>
        </NeumorphCard>
      </div>
      
      {/* Right Column - Stats & Suggestions */}
      <div className="space-y-8">
        <NeumorphCard title="Session Statistics" className="animate-fade-in">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="neumorph-inner p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-bell-primary">{sessionsCompleted}</div>
              <div className="text-sm text-bell-muted">Sessions Today</div>
            </div>
            <div className="neumorph-inner p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-bell-primary">
                {Math.floor(sessionsCompleted * selectedMode.duration / 60)}
              </div>
              <div className="text-sm text-bell-muted">Focus Minutes</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium mb-2">Recent Focus Sessions</h4>
            <div className="neumorph-inner p-3 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-medium">Deep Work</div>
                <div className="text-xs text-bell-muted">50 minutes</div>
              </div>
              <div className="text-bell-muted text-sm">10:30 AM</div>
            </div>
            
            <div className="neumorph-inner p-3 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-medium">Standard Focus</div>
                <div className="text-xs text-bell-muted">25 minutes</div>
              </div>
              <div className="text-bell-muted text-sm">9:45 AM</div>
            </div>
          </div>
        </NeumorphCard>
        
        {/* Break Suggestion Card */}
        {showBreakSuggestion && (
          <NeumorphCard className="animate-scale-in bg-blue-50 border border-blue-100">
            <div className="flex flex-col items-center p-4 text-center">
              <Coffee size={32} className="text-blue-500 mb-3" />
              <h3 className="text-lg font-medium mb-2 text-blue-700">Time for a break!</h3>
              <p className="text-blue-600 text-sm mb-4">
                You've completed 2 focus sessions. Taking a short break will help maintain your cognitive energy.
              </p>
              <div className="flex gap-3">
                <NeumorphButton 
                  variant="primary"
                  size="sm"
                  onClick={() => setShowBreakSuggestion(false)}
                >
                  Take 5 Minutes
                </NeumorphButton>
                <NeumorphButton 
                  size="sm"
                  variant="outlined"
                  onClick={() => setShowBreakSuggestion(false)}
                >
                  Skip
                </NeumorphButton>
              </div>
            </div>
          </NeumorphCard>
        )}
        
        <NeumorphCard title="Focus Tips" className="animate-fade-in">
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-green-700">
                Start with your most challenging task when your energy is highest.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700">
                Take a 30-second mini-break between pomodoros to stretch and reset.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-700">
                For deep work sessions, put your phone in another room to avoid distractions.
              </p>
            </div>
          </div>
        </NeumorphCard>
      </div>
    </div>
  );
};

export default PomodoroTimer;
