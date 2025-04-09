
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import NeumorphCard from '@/components/NeumorphCard';
import { ArrowUp, Trash2, Calendar, FolderPlus, UserPlus, Star } from 'lucide-react';

type InboxItem = {
  id: string;
  content: string;
  timestamp: Date;
  priority?: 'high' | 'medium' | 'low';
};

const Inbox: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [input, setInput] = useState('');
  const [items, setItems] = useState<InboxItem[]>([
    {
      id: '1',
      content: 'Schedule quarterly planning session with leadership team',
      timestamp: new Date(),
      priority: 'high',
    },
    {
      id: '2',
      content: 'Review the latest user feedback from the beta launch',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      content: 'Follow up on partnership opportunity with XYZ Corp',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      priority: 'medium',
    },
  ]);
  const [minimalistMode, setMinimalistMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newItem: InboxItem = {
      id: Date.now().toString(),
      content: input.trim(),
      timestamp: new Date(),
    };

    setItems([newItem, ...items]);
    setInput('');
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const setPriority = (id: string, priority?: 'high' | 'medium' | 'low') => {
    setItems(items.map(item => 
      item.id === id ? { ...item, priority } : item
    ));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return 'Today';
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      minimalistMode ? "bg-white" : "bg-bell-background"
    )}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">{t('inbox')}</h1>
          
          <button
            onClick={() => setMinimalistMode(!minimalistMode)}
            className={cn(
              "px-3 py-1 rounded-lg text-sm transition-colors",
              minimalistMode ? "bg-bell-primary text-white" : "bg-bell-subtle text-bell-foreground"
            )}
          >
            {minimalistMode ? 'Standard Mode' : 'Minimalist Mode'}
          </button>
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What's on your mind? Capture thoughts, tasks, or ideas here..."
              className={cn(
                "w-full p-4 min-h-24 transition-all duration-300",
                minimalistMode
                  ? "border-0 shadow-none text-xl focus:ring-0 focus:outline-none resize-none"
                  : "bell-input resize-y"
              )}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={cn(
                "absolute bottom-3 right-3 p-2 rounded-full transition-all",
                input.trim()
                  ? "bg-bell-primary text-white hover:bg-bell-primary/90"
                  : "bg-bell-muted/50 text-bell-muted cursor-not-allowed"
              )}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        {/* Items List */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-10 text-bell-muted">
              <p>Your inbox is empty. Capture your thoughts above!</p>
            </div>
          ) : (
            items.map(item => (
              <NeumorphCard 
                key={item.id} 
                className={cn(
                  "p-4 relative group transition-all duration-200",
                  minimalistMode ? "shadow-none border border-gray-100" : "",
                  item.priority === 'high' ? "border-l-4 border-l-red-400" : 
                  item.priority === 'medium' ? "border-l-4 border-l-yellow-400" : 
                  item.priority === 'low' ? "border-l-4 border-l-green-400" : ""
                )}
              >
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-lg">{item.content}</p>
                    <p className="text-sm text-bell-muted mt-2">{formatDate(item.timestamp)}</p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className={cn(
                    "flex items-center gap-1 transition-opacity duration-200",
                    minimalistMode ? "opacity-0 group-hover:opacity-100" : ""
                  )}>
                    {/* Priority buttons */}
                    <button 
                      onClick={() => setPriority(item.id, 'high')}
                      className={cn(
                        "p-1.5 rounded-full transition-colors",
                        item.priority === 'high' ? "text-red-500 bg-red-50" : "text-bell-muted hover:bg-bell-subtle"
                      )}
                      title="High priority"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    
                    {/* Assign to project */}
                    <button 
                      className="p-1.5 rounded-full text-bell-muted hover:bg-bell-subtle transition-colors"
                      title="Assign to project"
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>
                    
                    {/* Add to calendar */}
                    <button 
                      className="p-1.5 rounded-full text-bell-muted hover:bg-bell-subtle transition-colors"
                      title="Add to calendar"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    
                    {/* Delegate */}
                    <button 
                      className="p-1.5 rounded-full text-bell-muted hover:bg-bell-subtle transition-colors"
                      title="Delegate"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    
                    {/* Delete */}
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 rounded-full text-bell-muted hover:bg-bell-subtle transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </NeumorphCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
