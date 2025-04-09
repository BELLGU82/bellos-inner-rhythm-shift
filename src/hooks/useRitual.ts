
import { useState, useEffect } from 'react';
import { useRitualUtils } from '@/utils/dataUtils';
import { useToast } from '@/hooks/use-toast';

export type Mode = 'creation' | 'leadership' | 'stillness';

export interface RitualFormData {
  focusAreas: string[];
  highestRoiTask: string;
  notDoingItems: string[];
  selectedMode: Mode;
}

export const useRitual = () => {
  const { saveRitual, getTodayRitual, hasCompletedTodayRitual } = useRitualUtils();
  const [step, setStep] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Initialize with empty or today's ritual data if available
  const todayRitual = getTodayRitual();
  const [ritualData, setRitualData] = useState<RitualFormData>({
    focusAreas: todayRitual?.focusAreas || ['', '', ''],
    highestRoiTask: todayRitual?.highestRoiTask || '',
    notDoingItems: todayRitual?.notDoingItems.length ? todayRitual.notDoingItems : [''],
    selectedMode: todayRitual?.selectedMode || 'creation',
  });
  
  // Check if today's ritual is completed
  const [isRitualCompleted, setIsRitualCompleted] = useState<boolean>(
    hasCompletedTodayRitual()
  );
  
  // Update state when today's ritual changes
  useEffect(() => {
    setIsRitualCompleted(hasCompletedTodayRitual());
  }, [hasCompletedTodayRitual]);

  const handleFocusAreaChange = (index: number, value: string) => {
    const newFocusAreas = [...ritualData.focusAreas];
    newFocusAreas[index] = value;
    setRitualData({ ...ritualData, focusAreas: newFocusAreas });
  };

  const handleNotDoingChange = (index: number, value: string) => {
    const newNotDoingItems = [...ritualData.notDoingItems];
    newNotDoingItems[index] = value;
    setRitualData({ ...ritualData, notDoingItems: newNotDoingItems });
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
      setRitualData({ ...ritualData, notDoingItems: newNotDoingItems });
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
    saveRitual(ritualData, true);
    setIsRitualCompleted(true);
    setShowModal(false);
    
    toast({
      title: 'Ritual completed',
      description: 'Your CEO ritual for today has been saved.',
    });
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

  return {
    step,
    showModal,
    ritualData,
    isRitualCompleted,
    handleFocusAreaChange,
    handleNotDoingChange,
    addNotDoingItem,
    removeNotDoingItem,
    handleModeSelect,
    beginRitual,
    completeRitual,
    nextStep,
    prevStep,
    setShowModal
  };
};
