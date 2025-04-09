import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Check, Clock, Calendar, AlarmClock, Sparkles } from 'lucide-react';

type ReminderType = 'mindset' | 'task' | 'recovery' | 'anchor';

interface AddReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReminder: (reminder: {
    time: string;
    title: string;
    type: ReminderType;
  }) => void;
}

const AddReminderDialog: React.FC<AddReminderDialogProps> = ({
  isOpen,
  onClose,
  onAddReminder,
}) => {
  const { t, language, isRTL } = useLanguage();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [reminderType, setReminderType] = useState<ReminderType>('task');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && time) {
      onAddReminder({
        time,
        title,
        type: reminderType,
      });
      setTitle('');
      setTime('');
      setReminderType('task');
      onClose();
    }
  };

  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: language !== 'he'
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`neumorph-card w-full max-w-md p-6 rounded-2xl animate-fade-in ${isRTL ? 'rtl' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
            {language === 'he' ? 'הוספת תזכורת חדשה' : 'Add New Reminder'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-bell-subtle transition-colors"
          >
            <X size={20} className="text-bell-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className={`block mb-2 ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                {language === 'he' ? 'כותרת' : 'Title'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full neumorph-inner p-3 rounded-xl bg-transparent"
                placeholder={language === 'he' ? 'הזן כותרת תזכורת...' : 'Enter reminder title...'}
                required
              />
            </div>

            <div>
              <label className={`block mb-2 ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                {language === 'he' ? 'זמן' : 'Time'}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full neumorph-inner p-3 rounded-xl bg-transparent"
                required
              />
            </div>

            <div>
              <label className={`block mb-2 ${language === 'he' ? 'font-miriam' : 'font-mono'}`}>
                {language === 'he' ? 'סוג תזכורת' : 'Reminder Type'}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setReminderType('mindset')}
                  className={`neumorph-btn p-3 rounded-xl flex items-center justify-center ${
                    reminderType === 'mindset' ? 'ring-2 ring-bell-primary' : ''
                  }`}
                >
                  <Sparkles size={16} className="text-bell-primary mr-2" />
                  <span className={language === 'he' ? 'font-miriam' : 'font-mono'}>
                    {language === 'he' ? 'מיינדסט' : 'Mindset'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setReminderType('task')}
                  className={`neumorph-btn p-3 rounded-xl flex items-center justify-center ${
                    reminderType === 'task' ? 'ring-2 ring-bell-secondary' : ''
                  }`}
                >
                  <Check size={16} className="text-bell-secondary mr-2" />
                  <span className={language === 'he' ? 'font-miriam' : 'font-mono'}>
                    {language === 'he' ? 'משימה' : 'Task'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setReminderType('recovery')}
                  className={`neumorph-btn p-3 rounded-xl flex items-center justify-center ${
                    reminderType === 'recovery' ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <AlarmClock size={16} className="text-green-500 mr-2" />
                  <span className={language === 'he' ? 'font-miriam' : 'font-mono'}>
                    {language === 'he' ? 'התאוששות' : 'Recovery'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setReminderType('anchor')}
                  className={`neumorph-btn p-3 rounded-xl flex items-center justify-center ${
                    reminderType === 'anchor' ? 'ring-2 ring-amber-500' : ''
                  }`}
                >
                  <Calendar size={16} className="text-amber-500 mr-2" />
                  <span className={language === 'he' ? 'font-miriam' : 'font-mono'}>
                    {language === 'he' ? 'עוגן' : 'Anchor'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bell-secondary-btn mr-2"
              >
                {language === 'he' ? 'ביטול' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="bell-primary-btn"
              >
                {language === 'he' ? 'הוסף תזכורת' : 'Add Reminder'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReminderDialog;