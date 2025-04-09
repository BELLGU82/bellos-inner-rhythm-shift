
import React, { useState } from 'react';
import { CircleX, Clock, ArrowUpCircle, Check, Plus, User, Trash2, Calendar } from 'lucide-react';
import NeumorphCard from '@/components/NeumorphCard';
import NeumorphButton from '@/components/NeumorphButton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Task types based on Eisenhower matrix
type TaskCategory = 'do' | 'schedule' | 'delegate' | 'delete';

// Task interface
interface Task {
  id: number;
  title: string;
  urgency: number; // 1-10
  importance: number; // 1-10
  estimatedHours: number;
  category: TaskCategory;
}

const Delegation = () => {
  // Sample hourly value
  const [hourlyValue, setHourlyValue] = useState<number>(250);
  
  // Task form state
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'category'>>({
    title: '',
    urgency: 5,
    importance: 5,
    estimatedHours: 1
  });

  // Tasks data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "כתיבת תוכן לניוזלטר",
      urgency: 7,
      importance: 4,
      estimatedHours: 2,
      category: 'delegate'
    },
    {
      id: 2,
      title: "פגישה עם משקיע חדש",
      urgency: 9,
      importance: 9,
      estimatedHours: 1.5,
      category: 'do'
    },
    {
      id: 3,
      title: "סידור מסמכים",
      urgency: 3,
      importance: 2,
      estimatedHours: 1,
      category: 'delete'
    },
    {
      id: 4,
      title: "עדכון אסטרטגיית מוצר",
      urgency: 5,
      importance: 8,
      estimatedHours: 3,
      category: 'schedule'
    },
    {
      id: 5,
      title: "בדיקת דוחות חודשיים",
      urgency: 8,
      importance: 7,
      estimatedHours: 1,
      category: 'do'
    }
  ]);

  // Function to determine task category based on importance and urgency
  const determineCategory = (importance: number, urgency: number): TaskCategory => {
    if (importance >= 7 && urgency >= 7) return 'do';
    if (importance >= 7 && urgency < 7) return 'schedule';
    if (importance < 7 && urgency >= 7) return 'delegate';
    return 'delete';
  };

  // Add new task
  const handleAddTask = () => {
    if (!newTask.title) return;
    
    const category = determineCategory(newTask.importance, newTask.urgency);
    const newId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    
    setTasks([...tasks, { ...newTask, id: newId, category }]);
    
    // Reset form
    setNewTask({
      title: '',
      urgency: 5,
      importance: 5,
      estimatedHours: 1
    });
  };

  // Filter tasks by category
  const tasksByCategory = {
    do: tasks.filter(task => task.category === 'do'),
    schedule: tasks.filter(task => task.category === 'schedule'),
    delegate: tasks.filter(task => task.category === 'delegate'),
    delete: tasks.filter(task => task.category === 'delete')
  };

  // Calculate value and ROI
  const calculateTaskValue = (task: Task) => {
    return (task.importance * task.urgency) / 10;
  };

  const calculateTaskROI = (task: Task) => {
    const value = calculateTaskValue(task);
    return value / task.estimatedHours;
  };

  // Get recurring patterns
  const getRecurringPatterns = () => {
    const delegatedTitles = tasksByCategory.delegate.map(t => t.title.toLowerCase());
    const words = delegatedTitles.join(' ').split(/\s+/);
    
    // Simple approach: find words that appear multiple times
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 3) { // Only consider words longer than 3 chars
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // Get most frequent words
    return Object.entries(wordCount)
      .filter(([_, count]) => count > 1)
      .sort(([_, countA], [__, countB]) => countB - countA)
      .slice(0, 3)
      .map(([word]) => word);
  };

  const recurringPatterns = getRecurringPatterns();

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-bell-foreground">מטריצת האצלה</h1>
          <p className="text-bell-muted">להחליט מה לעשות, מה להאציל, ומה למחוק</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <NeumorphCard className="animate-fade-in mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-lg font-semibold mb-4 text-bell-foreground">הוסף משימה חדשה</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">כותרת משימה</Label>
                    <Input 
                      id="task-title" 
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className="bell-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="task-importance" className="mb-1 block">
                      חשיבות: {newTask.importance}
                    </Label>
                    <input 
                      id="task-importance"
                      type="range" 
                      min="1" 
                      max="10" 
                      value={newTask.importance}
                      onChange={(e) => setNewTask({...newTask, importance: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="task-urgency" className="mb-1 block">
                      דחיפות: {newTask.urgency}
                    </Label>
                    <input 
                      id="task-urgency"
                      type="range" 
                      min="1" 
                      max="10" 
                      value={newTask.urgency}
                      onChange={(e) => setNewTask({...newTask, urgency: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="task-hours">שעות עבודה משוערות</Label>
                    <Input 
                      id="task-hours"
                      type="number" 
                      min="0.5" 
                      step="0.5"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask({...newTask, estimatedHours: parseFloat(e.target.value) || 1})}
                      className="bell-input"
                    />
                  </div>
                  
                  <NeumorphButton 
                    variant="primary" 
                    className="w-full mt-4" 
                    icon={<Plus size={16} />}
                    onClick={handleAddTask}
                  >
                    הוסף משימה
                  </NeumorphButton>
                </div>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-lg font-semibold mb-4 text-bell-foreground">מחשבון ערך שעת עבודה</h3>
                <div className="neumorph-inner p-6 rounded-xl space-y-6">
                  <div>
                    <Label htmlFor="hourly-value" className="mb-1 block">ערך שעת עבודה שלי (₪)</Label>
                    <Input 
                      id="hourly-value"
                      type="number" 
                      value={hourlyValue}
                      onChange={(e) => setHourlyValue(parseInt(e.target.value) || 0)}
                      className="bell-input"
                    />
                  </div>
                  
                  <div className="p-4 bg-bell-subtle rounded-lg">
                    <h4 className="font-medium mb-2">תובנות ROI:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <ArrowUpCircle size={16} className="text-green-500" />
                        <span>כדאי לך לבצע משימות בערך של {hourlyValue}₪+ לשעה</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <User size={16} className="text-amber-500" />
                        <span>כדאי להאציל משימות בערך של &lt;{hourlyValue}₪ לשעה</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Trash2 size={16} className="text-rose-500" />
                        <span>כדאי למחוק משימות בערך נמוך ודחיפות נמוכה</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </NeumorphCard>

          <div className="grid grid-cols-2 gap-4">
            <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="p-4 neumorph-inner rounded-xl">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Check size={18} className="text-green-500" />
                  <span>לעשות</span>
                </h3>
                <ul className="space-y-3">
                  {tasksByCategory.do.map(task => (
                    <li key={task.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-sm text-green-600">
                          ROI: {calculateTaskROI(task).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-bell-muted">
                        <Clock size={12} />
                        <span>{task.estimatedHours}h</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </NeumorphCard>
            
            <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <div className="p-4 neumorph-inner rounded-xl">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-blue-500" />
                  <span>לתכנן</span>
                </h3>
                <ul className="space-y-3">
                  {tasksByCategory.schedule.map(task => (
                    <li key={task.id} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-sm text-blue-600">
                          ROI: {calculateTaskROI(task).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-bell-muted">
                        <Clock size={12} />
                        <span>{task.estimatedHours}h</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </NeumorphCard>
            
            <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="p-4 neumorph-inner rounded-xl">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <User size={18} className="text-amber-500" />
                  <span>להאציל</span>
                </h3>
                <ul className="space-y-3">
                  {tasksByCategory.delegate.map(task => (
                    <li key={task.id} className="p-3 bg-amber-50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-sm text-amber-600">
                          ROI: {calculateTaskROI(task).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-bell-muted">
                        <Clock size={12} />
                        <span>{task.estimatedHours}h</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </NeumorphCard>
            
            <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <div className="p-4 neumorph-inner rounded-xl">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <CircleX size={18} className="text-rose-500" />
                  <span>למחוק</span>
                </h3>
                <ul className="space-y-3">
                  {tasksByCategory.delete.map(task => (
                    <li key={task.id} className="p-3 bg-rose-50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-sm text-rose-600">
                          ROI: {calculateTaskROI(task).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-bell-muted">
                        <Clock size={12} />
                        <span>{task.estimatedHours}h</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </NeumorphCard>
          </div>
        </div>
        
        <div>
          <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-semibold mb-4 text-bell-foreground">תובנות האצלה</h3>
            <div className="space-y-6">
              {recurringPatterns.length > 0 && (
                <div className="p-4 neumorph-inner rounded-xl">
                  <h4 className="font-medium mb-3">דפוסים חוזרים</h4>
                  <ul className="space-y-2">
                    {recurringPatterns.map((pattern, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-bell-accent"></div>
                        <span>"{pattern}" - מופיע בכמה משימות להאצלה</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="p-4 neumorph-inner rounded-xl">
                <h4 className="font-medium mb-3">סיכום השבוע</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">משימות לביצוע:</span>
                    <span className="font-medium">{tasksByCategory.do.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">משימות לתכנון:</span>
                    <span className="font-medium">{tasksByCategory.schedule.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">משימות להאצלה:</span>
                    <span className="font-medium">{tasksByCategory.delegate.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">משימות למחיקה:</span>
                    <span className="font-medium">{tasksByCategory.delete.length}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-bell-muted/20">
                    <span className="text-sm font-medium">סה״כ שעות להאצלה:</span>
                    <span className="font-medium">
                      {tasksByCategory.delegate.reduce((sum, task) => sum + task.estimatedHours, 0)}h
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 neumorph-inner rounded-xl">
                <h4 className="font-medium mb-3">מה לא שייך לי יותר?</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-bell-accent"></div>
                    <span>משימות טכניות בערך נמוך</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-bell-accent"></div>
                    <span>פגישות ללא יעד ברור</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-bell-accent"></div>
                    <span>תמיכה בלקוחות קטנים</span>
                  </li>
                </ul>
              </div>
            </div>
          </NeumorphCard>
        </div>
      </div>
    </div>
  );
};

export default Delegation;
