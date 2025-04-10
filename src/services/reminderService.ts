import { v4 as uuidv4 } from 'uuid';
import { parseISO, isAfter } from 'date-fns';
import { formatDistance } from 'date-fns';
import { he } from 'date-fns/locale';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  recurring?: boolean;
  createdAt: Date;
}

export const isOverdue = (reminder: Reminder): boolean => {
  if (!reminder.dueDate || reminder.completed) return false;
  return isAfter(new Date(), reminder.dueDate);
};

export const getDueText = (reminder: Reminder): string => {
  if (!reminder.dueDate) return 'ללא תאריך יעד';
  
  return formatDistance(reminder.dueDate, new Date(), {
    addSuffix: true,
    locale: he
  });
};

export const subscribeToReminders = (
  callback: (reminders: Reminder[]) => void
): (() => void) => {
  // This is a placeholder for an actual subscription
  // In a real app, this would connect to a real-time database
  
  // For now, just return a mock unsubscribe function
  return () => {};
};

export const createReminder = (data: Omit<Reminder, 'id' | 'createdAt'>): Reminder => {
  return {
    ...data,
    id: uuidv4(),
    createdAt: new Date()
  };
};

export const updateReminder = (reminder: Reminder): Reminder => {
  // This would update the reminder in a real database
  return reminder;
};

export const deleteReminder = (id: string): boolean => {
  // This would delete the reminder from a real database
  return true;
};

export const toggleReminderComplete = (reminder: Reminder): Reminder => {
  return {
    ...reminder,
    completed: !reminder.completed
  };
};
