import React, { useState } from 'react';
import NeumorphCard from '@/components/NeumorphCard';
import NeumorphButton from '@/components/NeumorphButton';
import { ArrowUpCircle, Clock, BarChart3, Heart, CheckCircle, XCircle, ArrowRightCircle, Plus, Filter, Search } from 'lucide-react';
type TaskType = {
  id: number;
  title: string;
  description: string;
  roi: number; // 1-10 scale
  time: number; // in minutes
  emotion: 'positive' | 'neutral' | 'draining';
  urgency: 'high' | 'medium' | 'low';
  status: 'todo' | 'inProgress' | 'delegated' | 'done' | 'deferred';
};
const sampleTasks: TaskType[] = [{
  id: 1,
  title: 'Finalize Q2 product roadmap',
  description: 'Complete the strategic roadmap for Q2 product development.',
  roi: 9.2,
  time: 45,
  emotion: 'positive',
  urgency: 'high',
  status: 'todo'
}, {
  id: 2,
  title: 'Conduct team performance reviews',
  description: 'Review and provide feedback for Q1 performance.',
  roi: 7.5,
  time: 120,
  emotion: 'neutral',
  urgency: 'medium',
  status: 'todo'
}, {
  id: 3,
  title: 'Review monthly expenses',
  description: 'Analyze and categorize expenses for the past month.',
  roi: 4.8,
  time: 30,
  emotion: 'draining',
  urgency: 'low',
  status: 'todo'
}, {
  id: 4,
  title: 'Customer feedback analysis',
  description: 'Review recent customer surveys and identify patterns.',
  roi: 8.3,
  time: 60,
  emotion: 'positive',
  urgency: 'medium',
  status: 'inProgress'
}, {
  id: 5,
  title: 'Website content update',
  description: 'Refresh landing page copy to highlight new features.',
  roi: 6.7,
  time: 90,
  emotion: 'neutral',
  urgency: 'low',
  status: 'delegated'
}];
const TaskLadder = () => {
  const [tasks, setTasks] = useState<TaskType[]>(sampleTasks);
  const [filter, setFilter] = useState<'all' | 'roi' | 'urgency'>('all');
  const getEmotionIcon = (emotion: TaskType['emotion']) => {
    switch (emotion) {
      case 'positive':
        return <Heart size={16} className="text-green-500" />;
      case 'neutral':
        return <Heart size={16} className="text-blue-500" />;
      case 'draining':
        return <Heart size={16} className="text-red-500" />;
      default:
        return <Heart size={16} className="text-gray-500" />;
    }
  };
  const getUrgencyColor = (urgency: TaskType['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };
  const getRoiColor = (roi: number) => {
    if (roi >= 8) return 'text-green-500';
    if (roi >= 5) return 'text-blue-500';
    return 'text-gray-500';
  };
  const changeTaskStatus = (id: number, status: TaskType['status']) => {
    setTasks(prev => prev.map(task => task.id === id ? {
      ...task,
      status
    } : task));
  };
  const filteredTasks = () => {
    let sorted = [...tasks];
    switch (filter) {
      case 'roi':
        sorted.sort((a, b) => b.roi - a.roi);
        break;
      case 'urgency':
        // Convert urgency to numeric value for sorting
        const urgencyValue = (urgency: TaskType['urgency']) => {
          switch (urgency) {
            case 'high':
              return 3;
            case 'medium':
              return 2;
            case 'low':
              return 1;
            default:
              return 0;
          }
        };
        sorted.sort((a, b) => urgencyValue(b.urgency) - urgencyValue(a.urgency));
        break;
      default:
        // Default sorting combines ROI and urgency
        sorted.sort((a, b) => {
          const aValue = a.roi * (a.urgency === 'high' ? 1.5 : a.urgency === 'medium' ? 1.2 : 1);
          const bValue = b.roi * (b.urgency === 'high' ? 1.5 : b.urgency === 'medium' ? 1.2 : 1);
          return bValue - aValue;
        });
    }
    return sorted;
  };
  return <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="neumorph-sm p-2 rounded-full">
            <BarChart3 size={24} className="text-bell-primary" />
          </div>
          <h2 className="text-2xl font-normal">ROI Task Ladder</h2>
        </div>
        
        <div className="flex gap-4">
          <div className="neumorph-inner flex items-center rounded-lg px-3">
            <Search size={18} className="text-bell-muted mr-2" />
            <input type="text" placeholder="Search tasks..." className="bg-transparent border-none focus:outline-none py-2" />
          </div>
          
          <div className="flex">
            <NeumorphButton size="sm" className={`rounded-l-lg rounded-r-none px-4 ${filter === 'all' ? 'bg-bell-primary text-white' : ''}`} onClick={() => setFilter('all')}>
              All
            </NeumorphButton>
            <NeumorphButton size="sm" className={`rounded-none px-4 ${filter === 'roi' ? 'bg-bell-primary text-white' : ''}`} onClick={() => setFilter('roi')}>
              ROI
            </NeumorphButton>
            <NeumorphButton size="sm" className={`rounded-r-lg rounded-l-none px-4 ${filter === 'urgency' ? 'bg-bell-primary text-white' : ''}`} onClick={() => setFilter('urgency')}>
              Urgency
            </NeumorphButton>
          </div>
          
          <NeumorphButton variant="primary" icon={<Plus size={16} />} className="text-zinc-400">
            New Task
          </NeumorphButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {filteredTasks().map(task => <NeumorphCard key={task.id} className={`animate-fade-in ${task.status === 'done' ? 'opacity-60' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-1">
                <div className="flex items-start">
                  <h3 className="text-lg font-medium flex-1">
                    {task.title}
                    {task.status === 'delegated' && <span className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded-full text-slate-500">
                        Delegated
                      </span>}
                  </h3>
                </div>
                <p className="text-bell-muted mt-1 mb-3">{task.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-2 text-bell-muted">
                    <ArrowUpCircle size={18} className={getRoiColor(task.roi)} />
                    <span>ROI: <strong>{task.roi}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-bell-muted">
                    <Clock size={18} />
                    <span>{task.time}m</span>
                  </div>
                  <div className="flex items-center gap-2 text-bell-muted">
                    {getEmotionIcon(task.emotion)}
                    <span className="capitalize">{task.emotion}</span>
                  </div>
                  <div className="flex items-center gap-2 text-bell-muted">
                    <Filter size={18} className={getUrgencyColor(task.urgency)} />
                    <span className="capitalize">{task.urgency}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap md:flex-nowrap gap-2 mt-4 md:mt-0 md:ml-4">
                {task.status !== 'done' && <>
                    <NeumorphButton size="sm" icon={<CheckCircle size={16} />} onClick={() => changeTaskStatus(task.id, 'done')} className="text-slate-500">
                      Done
                    </NeumorphButton>
                    <NeumorphButton size="sm" icon={<ArrowRightCircle size={16} />} onClick={() => changeTaskStatus(task.id, 'delegated')} className="text-slate-400">
                      Delegate
                    </NeumorphButton>
                    <NeumorphButton size="sm" icon={<XCircle size={16} />} onClick={() => changeTaskStatus(task.id, 'deferred')} className="text-slate-300">
                      Defer
                    </NeumorphButton>
                  </>}
                {task.status === 'done' && <NeumorphButton size="sm" icon={<ArrowUpCircle size={16} />} onClick={() => changeTaskStatus(task.id, 'todo')}>
                    Restore
                  </NeumorphButton>}
              </div>
            </div>
          </NeumorphCard>)}
      </div>
    </div>;
};
export default TaskLadder;