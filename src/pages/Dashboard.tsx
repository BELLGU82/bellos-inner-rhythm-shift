import React from 'react';
import NeumorphCard from '@/components/NeumorphCard';
import NeumorphButton from '@/components/NeumorphButton';
import ProgressRing from '@/components/ProgressRing';
import { Play, Clock, ArrowUpCircle, Target, BrainCircuit, Zap } from 'lucide-react';
const Dashboard = () => {
  // Sample data for the dashboard
  const focusAreas = [{
    id: 1,
    name: 'Product Innovation',
    progress: 65
  }, {
    id: 2,
    name: 'Team Leadership',
    progress: 40
  }, {
    id: 3,
    name: 'Growth Strategy',
    progress: 80
  }];
  const topTask = {
    title: 'Finalize Q2 product roadmap',
    roi: 8.4,
    timeEstimate: '45m',
    urgency: 'High'
  };
  const avoidToday = ['Email deep-diving', 'Social media', 'Low-ROI meetings'];
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-8">
        <NeumorphCard title="Daily Focus" className="animate-fade-in">
          <div className="grid md:grid-cols-3 gap-4">
            {focusAreas.map(area => <div key={area.id} className="flex flex-col items-center p-4 neumorph-inner rounded-xl">
                <h4 className="font-medium mb-3 text-bell-primary">{area.name}</h4>
                <ProgressRing progress={area.progress}>
                  <span className="text-lg font-medium">{area.progress}%</span>
                </ProgressRing>
              </div>)}
          </div>
        </NeumorphCard>
        
        <NeumorphCard title="Top ROI Task" className="animate-fade-in" style={{
        animationDelay: '0.1s'
      }}>
          <div className="p-4 neumorph-inner rounded-xl">
            <h3 className="text-xl font-medium text-bell-foreground mb-2">{topTask.title}</h3>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-bell-muted">
                <ArrowUpCircle size={18} className="text-green-500" />
                <span>ROI: {topTask.roi}</span>
              </div>
              <div className="flex items-center gap-2 text-bell-muted">
                <Clock size={18} />
                <span>{topTask.timeEstimate}</span>
              </div>
              <div className="flex items-center gap-2 text-bell-muted">
                <Zap size={18} className="text-amber-500" />
                <span>Urgency: {topTask.urgency}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <NeumorphButton variant="primary" icon={<Play size={16} />}>
                Start Now
              </NeumorphButton>
              <NeumorphButton variant="outlined">Delegate</NeumorphButton>
            </div>
          </div>
        </NeumorphCard>
        
        <NeumorphCard title="What Not To Do Today" className="animate-fade-in" style={{
        animationDelay: '0.2s'
      }}>
          <div className="p-4 neumorph-inner rounded-xl">
            <ul className="space-y-3">
              {avoidToday.map((item, index) => <li key={index} className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 rounded-full bg-bell-accent"></div>
                  <span>{item}</span>
                </li>)}
            </ul>
          </div>
        </NeumorphCard>
      </div>
      
      {/* Right Column */}
      <div className="space-y-8">
        <NeumorphCard className="animate-fade-in" style={{
        animationDelay: '0.3s'
      }}>
          <div className="text-center p-6">
            <div className="neumorph-sm inline-flex p-4 rounded-full mb-4">
              <BrainCircuit size={32} className="text-bell-primary" />
            </div>
            <h3 className="text-xl mb-2 font-medium">CEO Ritual</h3>
            <p className="text-bell-muted mb-6">Start your day with clarity and purpose</p>
            <NeumorphButton variant="primary" className="w-full" icon={<Play size={18} />}>
              Begin Ritual
            </NeumorphButton>
          </div>
        </NeumorphCard>
        
        <NeumorphCard title="Daily Progress" className="animate-fade-in" style={{
        animationDelay: '0.4s'
      }}>
          <div className="flex flex-col items-center gap-4 p-4">
            <ProgressRing progress={42} size={120} color="#4a6fa5">
              <div className="text-center">
                <div className="text-2xl font-medium">42%</div>
                <div className="text-xs text-bell-muted">Day Energy</div>
              </div>
            </ProgressRing>
            
            <div className="grid grid-cols-2 gap-4 w-full mt-2">
              <div className="neumorph-inner p-3 rounded-xl text-center">
                <div className="text-lg font-medium">3/7</div>
                <div className="text-xs text-bell-muted">Tasks Complete</div>
              </div>
              <div className="neumorph-inner p-3 rounded-xl text-center">
                <div className="text-lg font-medium">2h 15m</div>
                <div className="text-xs text-bell-muted">Focus Time</div>
              </div>
            </div>
          </div>
        </NeumorphCard>
        
        <NeumorphCard title="Growth Log" className="animate-fade-in" style={{
        animationDelay: '0.5s'
      }}>
          <div className="p-4 neumorph-inner rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-bell-accent" />
              <span className="text-sm">Completed CEO mindset exercise</span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={18} className="text-bell-accent" />
              <span className="text-sm">Made 3 delegation decisions</span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={18} className="text-bell-primary" />
              <span className="text-sm">Practiced strategic pause</span>
            </div>
          </div>
          <div className="mt-4 text-right">
            <NeumorphButton size="sm">View All</NeumorphButton>
          </div>
        </NeumorphCard>
      </div>
    </div>;
};
export default Dashboard;