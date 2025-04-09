
import React, { useState } from 'react';
import { Wind, Music, Brain, Heart, RefreshCw, Send } from 'lucide-react';
import NeumorphCard from '@/components/NeumorphCard';
import NeumorphButton from '@/components/NeumorphButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BellRest = () => {
  // States for the different sections
  const [gratitudePoints, setGratitudePoints] = useState<string[]>([
    "הצוות המדהים שיש לי",
    "יכולת קבלת החלטות טובה",
    "",
    "",
    ""
  ]);
  const [releaseNote, setReleaseNote] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<'breathing' | 'mindfulness' | 'sound'>('breathing');
  
  // Update gratitude point
  const updateGratitudePoint = (index: number, value: string) => {
    const updated = [...gratitudePoints];
    updated[index] = value;
    setGratitudePoints(updated);
  };
  
  // Convert gratitude points to tomorrow's message
  const convertToMessage = () => {
    const filledPoints = gratitudePoints.filter(point => point.trim() !== "");
    if (filledPoints.length === 0) return;
    
    alert("נקודות ההודיה הומרו להודעה למחר: " + filledPoints.join(", "));
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-bell-foreground">BellRest</h1>
          <p className="text-bell-muted">מרחב מנוחה והתחדשות</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - practices */}
        <div className="lg:col-span-2 space-y-8">
          <NeumorphCard className="animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 text-bell-foreground">תרגול יומי</h3>
            
            <div className="flex gap-4 mb-6">
              <NeumorphButton 
                variant={selectedExercise === 'breathing' ? "primary" : "default"}
                icon={<Wind size={18} />}
                onClick={() => setSelectedExercise('breathing')}
              >
                נשימה
              </NeumorphButton>
              
              <NeumorphButton 
                variant={selectedExercise === 'mindfulness' ? "primary" : "default"}
                icon={<Brain size={18} />}
                onClick={() => setSelectedExercise('mindfulness')}
              >
                מיינדפולנס
              </NeumorphButton>
              
              <NeumorphButton 
                variant={selectedExercise === 'sound' ? "primary" : "default"}
                icon={<Music size={18} />}
                onClick={() => setSelectedExercise('sound')}
              >
                צליל
              </NeumorphButton>
            </div>
            
            {selectedExercise === 'breathing' && (
              <div className="p-6 neumorph-inner rounded-xl">
                <h4 className="text-xl font-medium text-center mb-6">נשימה מאוזנת 4-4-4-4</h4>
                
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full neumorph-inner"></div>
                    <div className="absolute inset-4 rounded-full bg-bell-subtle flex items-center justify-center">
                      <span id="breathing-counter" className="text-3xl font-bold text-bell-primary">4</span>
                    </div>
                    <div id="breathing-circle" className="absolute inset-0 rounded-full border-4 border-bell-primary"></div>
                  </div>
                </div>
                
                <div className="text-center mt-8 space-y-4">
                  <p className="text-bell-foreground">שאפי למשך 4 שניות, החזיקי 4 שניות, נשפי 4 שניות, המתיני 4 שניות</p>
                  
                  <NeumorphButton 
                    variant="primary" 
                    className="px-8"
                  >
                    התחל תרגול
                  </NeumorphButton>
                </div>
              </div>
            )}
            
            {selectedExercise === 'mindfulness' && (
              <div className="p-6 neumorph-inner rounded-xl">
                <h4 className="text-xl font-medium text-center mb-6">מיינדפולנס - סריקת גוף</h4>
                
                <div className="space-y-4 text-center">
                  <p className="text-bell-foreground mb-6">
                    הקדישי 3 דקות לסריקת גוף מהירה. התחילי מכפות הרגליים ועלי לאט עד הראש, 
                    שימי לב לתחושות ולמתח שיש בכל אזור בגוף.
                  </p>
                  
                  <div className="flex justify-center gap-4">
                    <NeumorphButton variant="default">1 דקה</NeumorphButton>
                    <NeumorphButton variant="primary">3 דקות</NeumorphButton>
                    <NeumorphButton variant="default">5 דקות</NeumorphButton>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-bell-muted mb-4">שאלה לרפלקציה:</p>
                    <p className="text-lg text-bell-foreground font-medium">איפה בגוף את מרגישה את הלחץ הכי חזק?</p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedExercise === 'sound' && (
              <div className="p-6 neumorph-inner rounded-xl">
                <h4 className="text-xl font-medium text-center mb-6">צליל - מדיטציית קול</h4>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="neumorph-sm p-4 rounded-xl text-center cursor-pointer hover:shadow-neumorph-pressed transition-shadow">
                      <p className="font-medium mb-2">גלי אוקיינוס</p>
                      <div className="flex justify-center">
                        <Music size={32} className="text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="neumorph-sm p-4 rounded-xl text-center cursor-pointer hover:shadow-neumorph-pressed transition-shadow">
                      <p className="font-medium mb-2">יער רוגע</p>
                      <div className="flex justify-center">
                        <Music size={32} className="text-green-400" />
                      </div>
                    </div>
                    
                    <div className="neumorph-sm p-4 rounded-xl text-center cursor-pointer hover:shadow-neumorph-pressed transition-shadow">
                      <p className="font-medium mb-2">גשם רך</p>
                      <div className="flex justify-center">
                        <Music size={32} className="text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="neumorph-sm p-4 rounded-xl text-center cursor-pointer hover:shadow-neumorph-pressed transition-shadow">
                      <p className="font-medium mb-2">קערות טיבטיות</p>
                      <div className="flex justify-center">
                        <Music size={32} className="text-amber-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <NeumorphButton variant="primary">
                      התחל השמעה
                    </NeumorphButton>
                  </div>
                </div>
              </div>
            )}
          </NeumorphCard>

          <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-semibold mb-4 text-bell-foreground">שחרור והודיה</h3>
            
            <div className="space-y-6">
              <div className="p-5 neumorph-inner rounded-xl">
                <Label htmlFor="release-note" className="block mb-3 font-medium">
                  מה אני משחררת עכשיו?
                </Label>
                <textarea
                  id="release-note"
                  value={releaseNote}
                  onChange={(e) => setReleaseNote(e.target.value)}
                  placeholder="כתבי כאן את מה שאת רוצה לשחרר..."
                  className="bell-input w-full h-24 resize-none"
                ></textarea>
                
                <div className="flex justify-end mt-3">
                  <NeumorphButton 
                    variant="outlined" 
                    size="sm"
                    icon={<Send size={14} />}
                  >
                    שחרר
                  </NeumorphButton>
                </div>
              </div>
            </div>
          </NeumorphCard>
        </div>
        
        {/* Right column */}
        <div className="space-y-8">
          <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <Heart size={20} className="text-red-400" />
              <h3 className="text-lg font-semibold text-bell-foreground">5 נקודות הודיה</h3>
            </div>
            
            <div className="p-4 neumorph-inner rounded-xl">
              <div className="space-y-3">
                {gratitudePoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-bell-accent"></div>
                    <Input
                      value={point}
                      onChange={(e) => updateGratitudePoint(index, e.target.value)}
                      placeholder={`נקודת הודיה ${index + 1}`}
                      className="bell-input"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <NeumorphButton 
                  variant="default" 
                  size="sm"
                  icon={<RefreshCw size={14} />}
                >
                  נקה הכל
                </NeumorphButton>
                
                <NeumorphButton 
                  variant="primary" 
                  size="sm"
                  onClick={convertToMessage}
                >
                  המר להודעה
                </NeumorphButton>
              </div>
            </div>
          </NeumorphCard>
          
          <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-semibold mb-4 text-bell-foreground">אפירמציה יומית</h3>
            
            <div className="p-5 neumorph-inner rounded-xl">
              <p className="text-xl text-center font-medium text-bell-primary mb-4">
                "אני יוצרת עתיד מדויק עבורי מתוך נוכחות ובהירות"
              </p>
              
              <div className="flex justify-center mt-6">
                <NeumorphButton 
                  variant="outlined"
                  size="sm"
                >
                  החלף אפירמציה
                </NeumorphButton>
              </div>
            </div>
          </NeumorphCard>
          
          <NeumorphCard className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg font-semibold mb-4 text-bell-foreground">סטטיסטיקות</h3>
            
            <div className="p-4 neumorph-inner rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">תרגולי נשימה השבוע:</span>
                <span className="font-medium">7</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">הפסקות יזומות:</span>
                <span className="font-medium">12</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">זמן מנוחה ממוצע:</span>
                <span className="font-medium">8 דקות</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">סה״כ זמן התחדשות:</span>
                <span className="font-medium">84 דקות</span>
              </div>
            </div>
          </NeumorphCard>
        </div>
      </div>
    </div>
  );
};

export default BellRest;
