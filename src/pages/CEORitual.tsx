
import React, { useState } from 'react';
import { Palette, Crown, Wind, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { NeumorphCard } from '@/components/NeumorphCard';
import { NeumorphButton } from '@/components/NeumorphButton';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Mode = 'creation' | 'leadership' | 'stillness';

interface RitualData {
  focusAreas: string[];
  highestRoiTask: string;
  notDoingItems: string[];
  selectedMode: Mode;
}

const CEORitual: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [step, setStep] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [ritualData, setRitualData] = useState<RitualData>({
    focusAreas: ['', '', ''],
    highestRoiTask: '',
    notDoingItems: [''],
    selectedMode: 'creation',
  });

  const handleFocusAreaChange = (index: number, value: string) => {
    const newFocusAreas = [...ritualData.focusAreas];
    newFocusAreas[index] = value;
    setRitualData({ ...ritualData, focusAreas });
  };

  const handleNotDoingChange = (index: number, value: string) => {
    const newNotDoingItems = [...ritualData.notDoingItems];
    newNotDoingItems[index] = value;
    setRitualData({ ...ritualData, notDoingItems });
  };

  const addNotDoingItem = () => {
    if (ritualData.notDoingItems.length < 5) {
      setRitualData({
        ...ritualData,
        notDoingItems: [...ritualData.notDoingItems, ''],
      });
    }
  };

  const removeNotDoingItem = (index: number) => {
    if (ritualData.notDoingItems.length > 1) {
      const newNotDoingItems = ritualData.notDoingItems.filter((_, i) => i !== index);
      setRitualData({ ...ritualData, notDoingItems });
    }
  };

  const handleModeSelect = (mode: Mode) => {
    setRitualData({ ...ritualData, selectedMode: mode });
  };

  const beginRitual = () => {
    setShowModal(true);
    setStep(1);
  };

  const completeRitual = () => {
    // Here you would save the ritual data
    console.log('Ritual completed:', ritualData);
    setShowModal(false);
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      completeRitual();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">{t('ritual')}</h1>

      <div className="neumorph-card mb-8 p-8 text-center">
        <h2 className="text-xl font-bold mb-4">{t('good_morning')}</h2>

        {/* Focus Areas Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">{t('focus_areas')}</h3>
          <div className="grid gap-3">
            {ritualData.focusAreas.map((area, index) => (
              <Input
                key={index}
                placeholder={`${t('focus_areas')} ${index + 1}`}
                value={area}
                onChange={(e) => handleFocusAreaChange(index, e.target.value)}
                className="bell-input text-center"
              />
            ))}
          </div>
        </div>

        {/* Highest-ROI Task */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">{t('highest_roi')}</h3>
          <Input
            placeholder={t('highest_roi')}
            value={ritualData.highestRoiTask}
            onChange={(e) => setRitualData({ ...ritualData, highestRoiTask: e.target.value })}
            className="bell-input text-center"
          />
        </div>

        {/* Not Doing List */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">{t('not_doing')}</h3>
          <div className="space-y-3">
            {ritualData.notDoingItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`${t('not_doing')} ${index + 1}`}
                  value={item}
                  onChange={(e) => handleNotDoingChange(index, e.target.value)}
                  className="bell-input"
                />
                {ritualData.notDoingItems.length > 1 && (
                  <button 
                    onClick={() => removeNotDoingItem(index)}
                    className="p-2 rounded-full hover:bg-bell-subtle transition-colors"
                  >
                    <span className="sr-only">Remove</span>
                    <span aria-hidden="true">×</span>
                  </button>
                )}
              </div>
            ))}
            {ritualData.notDoingItems.length < 5 && (
              <button 
                onClick={addNotDoingItem}
                className="text-bell-primary hover:underline text-sm"
              >
                + Add another item
              </button>
            )}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Mode</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              className={cn(
                "flex flex-col items-center p-4 rounded-xl transition-all duration-200",
                ritualData.selectedMode === 'creation'
                  ? "bg-bell-primary text-white shadow-lg transform scale-105"
                  : "bg-bell-subtle hover:bg-bell-muted"
              )}
              onClick={() => handleModeSelect('creation')}
            >
              <Palette className="w-8 h-8 mb-2" />
              <span className="font-medium">{t('creation')}</span>
            </button>
            
            <button
              className={cn(
                "flex flex-col items-center p-4 rounded-xl transition-all duration-200",
                ritualData.selectedMode === 'leadership'
                  ? "bg-bell-primary text-white shadow-lg transform scale-105"
                  : "bg-bell-subtle hover:bg-bell-muted"
              )}
              onClick={() => handleModeSelect('leadership')}
            >
              <Crown className="w-8 h-8 mb-2" />
              <span className="font-medium">{t('leadership')}</span>
            </button>
            
            <button
              className={cn(
                "flex flex-col items-center p-4 rounded-xl transition-all duration-200",
                ritualData.selectedMode === 'stillness'
                  ? "bg-bell-primary text-white shadow-lg transform scale-105"
                  : "bg-bell-subtle hover:bg-bell-muted"
              )}
              onClick={() => handleModeSelect('stillness')}
            >
              <Wind className="w-8 h-8 mb-2" />
              <span className="font-medium">{t('stillness')}</span>
            </button>
          </div>
        </div>

        {/* Begin Ritual Button */}
        <NeumorphButton className="px-8 py-3 bg-accent-gradient text-white" onClick={beginRitual}>
          <span className="mr-2">{t('begin_ritual')}</span>
          <ArrowRight className="w-4 h-4" />
        </NeumorphButton>
      </div>

      {/* Ritual Guidance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="neumorph-card w-full max-w-lg p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Step {step}/4: {step === 1 ? 'Focus' : step === 2 ? 'Priority' : step === 3 ? 'Boundaries' : 'Mode'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-bell-subtle transition-colors"
              >
                <span className="sr-only">Close</span>
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mb-8">
              {step === 1 && (
                <div className="space-y-4">
                  <p>Define your top 3 focus areas for today. These are the themes that will guide your attention and energy.</p>
                  <div className="space-y-3">
                    {ritualData.focusAreas.map((area, index) => (
                      <Input
                        key={index}
                        placeholder={`Focus area ${index + 1}`}
                        value={area}
                        onChange={(e) => handleFocusAreaChange(index, e.target.value)}
                        className="bell-input"
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p>What is the single most important task today that will deliver the highest return on your investment of time and energy?</p>
                  <Input
                    placeholder="Your highest-ROI task"
                    value={ritualData.highestRoiTask}
                    onChange={(e) => setRitualData({ ...ritualData, highestRoiTask: e.target.value })}
                    className="bell-input"
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p>List the things you are explicitly NOT doing today. Setting boundaries is as important as setting goals.</p>
                  <div className="space-y-3">
                    {ritualData.notDoingItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`I'm not doing...`}
                          value={item}
                          onChange={(e) => handleNotDoingChange(index, e.target.value)}
                          className="bell-input"
                        />
                        {ritualData.notDoingItems.length > 1 && (
                          <button 
                            onClick={() => removeNotDoingItem(index)}
                            className="p-2 rounded-full hover:bg-bell-subtle transition-colors"
                          >
                            <span aria-hidden="true">×</span>
                          </button>
                        )}
                      </div>
                    ))}
                    {ritualData.notDoingItems.length < 5 && (
                      <button 
                        onClick={addNotDoingItem}
                        className="text-bell-primary hover:underline text-sm"
                      >
                        + Add another boundary
                      </button>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <p>Select the mode that best represents your energy and intention for today:</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      className={cn(
                        "flex flex-col items-center p-4 rounded-xl transition-all duration-200",
                        ritualData.selectedMode === 'creation'
                          ? "bg-bell-primary text-white shadow-lg transform scale-105"
                          : "bg-bell-subtle hover:bg-bell-muted"
                      )}
                      onClick={() => handleModeSelect('creation')}
                    >
                      <Palette className="w-8 h-8 mb-2" />
                      <span className="font-medium">{t('creation')}</span>
                    </button>
                    
                    <button
                      className={cn(
                        "flex flex-col items-center p-4 rounded-xl transition-all duration-200",
                        ritualData.selectedMode === 'leadership'
                          ? "bg-bell-primary text-white shadow-lg transform scale-105"
                          : "bg-bell-subtle hover:bg-bell-muted"
                      )}
                      onClick={() => handleModeSelect('leadership')}
                    >
                      <Crown className="w-8 h-8 mb-2" />
                      <span className="font-medium">{t('leadership')}</span>
                    </button>
                    
                    <button
                      className={cn(
                        "flex flex-col items-center p-4 rounded-xl transition-all duration-200",
                        ritualData.selectedMode === 'stillness'
                          ? "bg-bell-primary text-white shadow-lg transform scale-105"
                          : "bg-bell-subtle hover:bg-bell-muted"
                      )}
                      onClick={() => handleModeSelect('stillness')}
                    >
                      <Wind className="w-8 h-8 mb-2" />
                      <span className="font-medium">{t('stillness')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors",
                  step === 1 ? "opacity-50 cursor-not-allowed" : "bg-bell-subtle hover:bg-bell-muted"
                )}
                disabled={step === 1}
              >
                Back
              </button>
              
              <button
                onClick={nextStep}
                className="px-4 py-2 rounded-lg bg-bell-primary text-white hover:bg-bell-primary/90 transition-colors"
              >
                {step === 4 ? (
                  <span className="flex items-center">
                    Complete <Check className="ml-1 w-4 h-4" />
                  </span>
                ) : (
                  <span className="flex items-center">
                    Next <ArrowRight className="ml-1 w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CEORitual;
