
import React, { useState } from 'react';
import { Edit, Check, ArrowRight, Lightbulb, Star, Sparkles } from 'lucide-react';
import NeumorphCard from '@/components/NeumorphCard';
import NeumorphButton from '@/components/NeumorphButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Interface for identity pairs
interface IdentityPair {
  id: number;
  current: string;
  future: string;
}

const IdentityCore = () => {
  // Identity state
  const [identities, setIdentities] = useState<IdentityPair[]>([
    { id: 1, current: "מנהלת כל פרט בעצמי", future: "מנהיגה שמשחררת ומאצילה" },
    { id: 2, current: "רואה בעיות וחוששת", future: "רואה הזדמנויות ופועלת" },
    { id: 3, current: "מבזבזת זמן על פרטים קטנים", future: "ממוקדת בערך הגבוה ביותר" }
  ]);
  
  // Editable affirmation state
  const [affirmation, setAffirmation] = useState("אני מובילה את החזון שלי דרך אסטרטגיה ברורה ויצירת ערך עבור אחרים.");
  const [editingAffirmation, setEditingAffirmation] = useState(false);
  
  // Practice streak data
  const [streak, setStreak] = useState(14); // Days
  
  // Daily practice reflection state
  const [dailyReflection, setDailyReflection] = useState("");
  
  // Add new identity pair
  const addIdentityPair = () => {
    const newId = identities.length ? Math.max(...identities.map(id => id.id)) + 1 : 1;
    setIdentities([...identities, { id: newId, current: "", future: "" }]);
  };
  
  // Update identity pair
  const updateIdentity = (id: number, field: 'current' | 'future', value: string) => {
    setIdentities(identities.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  // Delete identity pair
  const deleteIdentity = (id: number) => {
    setIdentities(identities.filter(item => item.id !== id));
  };
  
  // Generate streak data for visualization
  const generateStreakData = () => {
    const days = 30; // Show last 30 days
    const data = [];
    
    for (let i = 0; i < days; i++) {
      // For demonstration, we'll show the streak as consistent for the streak days
      // and then some random practice before that
      const practiced = i < streak || Math.random() > 0.6;
      data.push({ day: days - i, practiced });
    }
    
    return data;
  };
  
  const streakData = generateStreakData();

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-bell-foreground">ליבת זהות</h1>
          <p className="text-bell-muted">חיזוק זהות ניהולית וחיבור למהות</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          <NeumorphCard className="animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 text-bell-foreground">תהליך זהות: מהיום למחר</h3>
            
            <div className="space-y-6">
              {identities.map(item => (
                <div key={item.id} className="p-5 neumorph-inner rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="md:col-span-2">
                      <Label htmlFor={`current-${item.id}`} className="block mb-2 text-sm text-bell-muted">
                        זהות נוכחית
                      </Label>
                      <Input
                        id={`current-${item.id}`}
                        value={item.current}
                        onChange={(e) => updateIdentity(item.id, 'current', e.target.value)}
                        placeholder="מה הדפוס הנוכחי שלי..."
                        className="bell-input"
                      />
                    </div>
                    
                    <div className="flex justify-center">
                      <div className="neumorph-sm h-10 w-10 rounded-full flex items-center justify-center">
                        <ArrowRight size={20} className="text-bell-primary" />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor={`future-${item.id}`} className="block mb-2 text-sm text-bell-muted">
                        זהות בבניה
                      </Label>
                      <Input
                        id={`future-${item.id}`}
                        value={item.future}
                        onChange={(e) => updateIdentity(item.id, 'future', e.target.value)}
                        placeholder="מי אני רוצה להיות..."
                        className="bell-input"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={() => deleteIdentity(item.id)}
                      className="text-bell-muted hover:text-bell-accent text-sm"
                    >
                      הסר
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center">
                <NeumorphButton
                  variant="outlined"
                  onClick={addIdentityPair}
                >
                  הוסף זהות חדשה
                </NeumorphButton>
              </div>
            </div>
          </NeumorphCard>
          
          <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-semibold mb-4 text-bell-foreground">שאלת רפלקציה יומית</h3>
            
            <div className="p-5 neumorph-inner rounded-xl">
              <p className="text-lg font-medium text-center mb-6">
                איך אני מתגלמת כאישה הזו היום?
              </p>
              
              <textarea
                value={dailyReflection}
                onChange={(e) => setDailyReflection(e.target.value)}
                placeholder="כתבי את התשובה שלך כאן..."
                className="bell-input w-full h-32 resize-none"
              ></textarea>
              
              <div className="flex justify-end mt-4">
                <NeumorphButton 
                  variant="primary"
                  icon={<Check size={16} />}
                >
                  שמור רפלקציה
                </NeumorphButton>
              </div>
            </div>
          </NeumorphCard>
        </div>
        
        {/* Right column */}
        <div className="space-y-8">
          <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-bell-foreground">אפירמציה</h3>
              <button 
                onClick={() => setEditingAffirmation(!editingAffirmation)}
                className="text-bell-muted hover:text-bell-primary"
              >
                <Edit size={18} />
              </button>
            </div>
            
            <div className="p-5 neumorph-inner rounded-xl">
              {editingAffirmation ? (
                <div className="space-y-4">
                  <textarea
                    value={affirmation}
                    onChange={(e) => setAffirmation(e.target.value)}
                    className="bell-input w-full h-24 resize-none"
                  ></textarea>
                  
                  <div className="flex justify-end">
                    <NeumorphButton 
                      variant="primary" 
                      size="sm"
                      icon={<Check size={14} />}
                      onClick={() => setEditingAffirmation(false)}
                    >
                      שמור
                    </NeumorphButton>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xl text-center font-medium text-bell-primary leading-relaxed">
                    "{affirmation}"
                  </p>
                  
                  <div className="flex justify-center mt-6">
                    <NeumorphButton variant="default" size="sm">
                      שנן
                    </NeumorphButton>
                  </div>
                </div>
              )}
            </div>
          </NeumorphCard>
          
          <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-amber-400" />
              <h3 className="text-lg font-semibold text-bell-foreground">רצף תרגול זהות</h3>
            </div>
            
            <div className="p-4 neumorph-inner rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="neumorph-sm h-14 w-14 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-bell-primary">{streak}</span>
                </div>
                <div>
                  <p className="font-medium">ימים רצופים</p>
                  <p className="text-sm text-bell-muted">של תרגול זהות</p>
                </div>
              </div>
              
              <div className="grid grid-cols-6 gap-1 mt-4">
                {streakData.map((day, index) => (
                  <div 
                    key={index}
                    className={`h-6 rounded ${day.practiced ? 'bg-bell-primary' : 'bg-bell-subtle'}`}
                    title={`יום ${day.day}: ${day.practiced ? 'תורגל' : 'לא תורגל'}`}
                  ></div>
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-bell-muted mt-1">
                <span>לפני 30 יום</span>
                <span>היום</span>
              </div>
            </div>
          </NeumorphCard>
          
          <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-amber-400" />
              <h3 className="text-lg font-semibold text-bell-foreground">תובנות זהות</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 neumorph-sm rounded-xl">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-bell-primary" />
                  <p className="text-sm font-medium">
                    זהויות חזקות מובילות להחלטות טובות יותר
                  </p>
                </div>
              </div>
              
              <div className="p-3 neumorph-sm rounded-xl">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-bell-primary" />
                  <p className="text-sm font-medium">
                    התרגול הרצוף משנה דפוסי חשיבה ישנים
                  </p>
                </div>
              </div>
              
              <div className="p-3 neumorph-sm rounded-xl">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-bell-primary" />
                  <p className="text-sm font-medium">
                    חיזוק זהות מקצועית מעלה ROI לאורך זמן
                  </p>
                </div>
              </div>
            </div>
          </NeumorphCard>
        </div>
      </div>
    </div>
  );
};

export default IdentityCore;
