
import React, { useState } from 'react';
import { Filter, PlusCircle, Clock, BarChart3, Target, AlertCircle } from 'lucide-react';
import NeumorphCard from '@/components/NeumorphCard';
import NeumorphButton from '@/components/NeumorphButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Project status types
type ProjectStatus = 'emerging' | 'active' | 'stuck';

// Project interface
interface Project {
  id: number;
  title: string;
  status: ProjectStatus;
  dailyRoi: number;
  currentFocus: string;
  topics: string[];
}

const ProcessMap = () => {
  // Sample projects data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: "מוצר חדש: פרזנטציה",
      status: 'active',
      dailyRoi: 8.5,
      currentFocus: "בניית סליידים",
      topics: ['מכירות', 'פיתוח']
    },
    {
      id: 2,
      title: "שיתוף פעולה עם XYZ",
      status: 'emerging',
      dailyRoi: 6.2,
      currentFocus: "פגישת היכרות ראשונית",
      topics: ['שיווק', 'פיתוח עסקי']
    },
    {
      id: 3,
      title: "שיפור תהליך גיוס",
      status: 'stuck',
      dailyRoi: 4.8,
      currentFocus: "כתיבת הגדרות תפקיד",
      topics: ['צוות', 'תפעול']
    },
    {
      id: 4,
      title: "אסטרטגיית צמיחה Q3",
      status: 'emerging',
      dailyRoi: 9.1,
      currentFocus: "מחקר שוק וניתוח מתחרים",
      topics: ['אסטרטגיה', 'פיננסים']
    },
    {
      id: 5,
      title: "מערכת CRM חדשה",
      status: 'stuck',
      dailyRoi: 7.3,
      currentFocus: "אפיון דרישות",
      topics: ['טכנולוגיה', 'תפעול']
    }
  ]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState<string>('');

  // Get all unique topics from projects
  const allTopics = Array.from(
    new Set(projects.flatMap(project => project.topics))
  );

  // Filter projects based on status and topic
  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesTopic = !topicFilter || project.topics.includes(topicFilter);
    return matchesStatus && matchesTopic;
  });

  // Status label and color mapping
  const statusConfig = {
    emerging: { label: 'בהתהוות', color: 'text-amber-500', bgColor: 'bg-amber-100' },
    active: { label: 'בביצוע', color: 'text-green-500', bgColor: 'bg-green-100' },
    stuck: { label: 'תקוע', color: 'text-rose-500', bgColor: 'bg-rose-100' }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-bell-foreground">מפת תהליכים</h1>
          <p className="text-bell-muted">ניהול תהליכים רוחביים בפרויקטים</p>
        </div>
        <NeumorphButton 
          variant="primary" 
          icon={<PlusCircle size={16} />}
        >
          פרויקט חדש
        </NeumorphButton>
      </header>

      <NeumorphCard className="animate-fade-in">
        <div className="flex flex-wrap gap-4 p-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-bell-muted" />
            <span className="text-sm font-medium">סינון לפי:</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter" className="text-sm">סטטוס:</Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                className="bell-input text-sm py-1 px-3"
              >
                <option value="all">הכל</option>
                <option value="emerging">בהתהוות</option>
                <option value="active">בביצוע</option>
                <option value="stuck">תקוע</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="topic-filter" className="text-sm">נושא:</Label>
              <select
                id="topic-filter"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="bell-input text-sm py-1 px-3"
              >
                <option value="">הכל</option>
                {allTopics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </NeumorphCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <NeumorphCard key={project.id} className="animate-scale-in h-full">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-bell-foreground">{project.title}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusConfig[project.status].bgColor} ${statusConfig[project.status].color}`}>
                  {statusConfig[project.status].label}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={16} className="text-bell-primary" />
                <span className="text-sm">
                  ROI יומי: <span className="font-medium">{project.dailyRoi}</span>
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Target size={16} className="text-bell-accent" />
                <span className="text-sm">
                  פוקוס נוכחי: <span className="font-medium">{project.currentFocus}</span>
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.topics.map(topic => (
                  <span 
                    key={topic} 
                    className="text-xs bg-bell-subtle px-2 py-1 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              
              <div className="mt-auto flex justify-between">
                <NeumorphButton 
                  variant="outlined" 
                  size="sm"
                  icon={<PlusCircle size={14} />}
                >
                  הוסף משימה
                </NeumorphButton>
                
                <NeumorphButton 
                  variant="default" 
                  size="sm"
                >
                  עדכן סטטוס
                </NeumorphButton>
              </div>
            </div>
          </NeumorphCard>
        ))}
      </div>
    </div>
  );
};

export default ProcessMap;
