// src/services/reminderService.ts
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high';
  category: string;
  recurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  tags: string[];
  completedAt?: Date;
}

// LocalStorage key
const REMINDERS_STORAGE_KEY = 'bellInnerRhythmShift_reminders';

// Helper functions
const loadRemindersFromStorage = (): Reminder[] => {
  try {
    const storedData = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!storedData) return [];
    
    const parsedData = JSON.parse(storedData);
    return parsedData.map((reminder: any) => ({
      ...reminder,
      createdAt: reminder.createdAt ? new Date(reminder.createdAt) : new Date(),
      dueDate: reminder.dueDate ? new Date(reminder.dueDate) : null,
      completedAt: reminder.completedAt ? new Date(reminder.completedAt) : undefined,
    }));
  } catch (error) {
    console.error('Failed to load reminders from storage:', error);
    return [];
  }
};

const saveRemindersToStorage = (reminders: Reminder[]) => {
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error('Failed to save reminders to storage:', error);
  }
};

// Event handlers for subscription
type RemindersChangeHandler = (reminders: Reminder[]) => void;
const changeHandlers: RemindersChangeHandler[] = [];

const notifyHandlers = (reminders: Reminder[]) => {
  changeHandlers.forEach(handler => handler(reminders));
};

// Subscription management
export const subscribeToReminders = (handler: RemindersChangeHandler) => {
  changeHandlers.push(handler);
  // Initial call with current data
  handler(loadRemindersFromStorage());
  
  // Return unsubscribe function
  return () => {
    const index = changeHandlers.indexOf(handler);
    if (index !== -1) {
      changeHandlers.splice(index, 1);
    }
  };
};

// CRUD operations
export const getAllReminders = (): Reminder[] => {
  return loadRemindersFromStorage();
};

export const getReminderById = (id: string): Reminder | undefined => {
  const reminders = loadRemindersFromStorage();
  return reminders.find(reminder => reminder.id === id);
};

export const addReminder = (reminder: Reminder): Reminder => {
  const reminders = loadRemindersFromStorage();
  
  // Ensure it has a unique ID
  if (!reminder.id) {
    reminder.id = crypto.randomUUID();
  }
  
  // Set creation time if not provided
  if (!reminder.createdAt) {
    reminder.createdAt = new Date();
  }
  
  // Add new reminder
  const updatedReminders = [...reminders, reminder];
  saveRemindersToStorage(updatedReminders);
  notifyHandlers(updatedReminders);
  
  // Schedule notification if it has a due date
  if (reminder.dueDate) {
    scheduleReminderNotification(reminder);
  }
  
  return reminder;
};

export const updateReminder = (updatedReminder: Reminder): Reminder => {
  const reminders = loadRemindersFromStorage();
  const index = reminders.findIndex(r => r.id === updatedReminder.id);
  
  if (index === -1) {
    throw new Error(`Reminder with id ${updatedReminder.id} not found`);
  }
  
  // If marking as completed, set completedAt
  if (updatedReminder.completed && !updatedReminder.completedAt) {
    updatedReminder.completedAt = new Date();
  }
  
  // If marking as not completed, remove completedAt
  if (!updatedReminder.completed) {
    delete updatedReminder.completedAt;
  }
  
  // Update the reminder
  const updatedReminders = [
    ...reminders.slice(0, index),
    updatedReminder,
    ...reminders.slice(index + 1)
  ];
  saveRemindersToStorage(updatedReminders);
  notifyHandlers(updatedReminders);
  
  // If reminder was updated and has a future due date, update notification
  if (updatedReminder.dueDate && new Date(updatedReminder.dueDate) > new Date()) {
    scheduleReminderNotification(updatedReminder);
  }
  
  return updatedReminder;
};

export const deleteReminder = (id: string): void => {
  const reminders = loadRemindersFromStorage();
  const updatedReminders = reminders.filter(reminder => reminder.id !== id);
  
  if (updatedReminders.length === reminders.length) {
    throw new Error(`Reminder with id ${id} not found`);
  }
  
  saveRemindersToStorage(updatedReminders);
  notifyHandlers(updatedReminders);
};

export const completeReminder = (id: string): Reminder => {
  const reminders = loadRemindersFromStorage();
  const index = reminders.findIndex(r => r.id === id);
  
  if (index === -1) {
    throw new Error(`Reminder with id ${id} not found`);
  }
  
  const updatedReminder = {
    ...reminders[index],
    completed: true,
    completedAt: new Date(),
  };
  
  // Handle recurring reminders when completed
  if (updatedReminder.recurring && updatedReminder.recurringPattern && updatedReminder.dueDate) {
    // Create the next occurrence
    const nextOccurrence = createNextRecurringReminder(updatedReminder);
    
    // We update the completed reminder, then add the new occurrence
    const updatedReminders = [
      ...reminders.slice(0, index),
      updatedReminder,
      ...reminders.slice(index + 1),
      nextOccurrence
    ];
    saveRemindersToStorage(updatedReminders);
    notifyHandlers(updatedReminders);
    
    return updatedReminder;
  } else {
    // Regular non-recurring reminder completion
    const updatedReminders = [
      ...reminders.slice(0, index),
      updatedReminder,
      ...reminders.slice(index + 1)
    ];
    saveRemindersToStorage(updatedReminders);
    notifyHandlers(updatedReminders);
    
    return updatedReminder;
  }
};

// Utility functions
export const isOverdue = (reminder: Reminder): boolean => {
  if (!reminder.dueDate || reminder.completed) return false;
  return new Date(reminder.dueDate) < new Date();
};

export const getDueText = (reminder: Reminder): string => {
  if (!reminder.dueDate) return 'אין תאריך יעד';
  
  try {
    const dueDate = new Date(reminder.dueDate);
    
    if (reminder.completed) {
      if (reminder.completedAt) {
        const completedDate = new Date(reminder.completedAt);
        const wasOverdue = completedDate > dueDate;
        
        if (wasOverdue) {
          return `הושלם באיחור של ${formatDistanceToNow(dueDate, { locale: he, addSuffix: false })}`;
        } else {
          return `הושלם לפני ${formatDistanceToNow(completedDate, { locale: he, addSuffix: false })}`;
        }
      }
      return 'הושלם';
    }
    
    const now = new Date();
    const isOverdueReminder = dueDate < now;
    
    if (isOverdueReminder) {
      return `באיחור של ${formatDistanceToNow(dueDate, { locale: he, addSuffix: false })}`;
    }
    
    return `נותרו ${formatDistanceToNow(dueDate, { locale: he, addSuffix: false })}`;
  } catch (error) {
    console.error('Error formatting due date', error);
    return 'תאריך יעד לא תקין';
  }
};

export const getUpcomingReminders = (days = 7): Reminder[] => {
  const reminders = loadRemindersFromStorage();
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + days);
  
  return reminders.filter(reminder => {
    if (reminder.completed || !reminder.dueDate) return false;
    const dueDate = new Date(reminder.dueDate);
    return dueDate >= now && dueDate <= cutoff;
  });
};

// Reminder notifications
const scheduleReminderNotification = (reminder: Reminder) => {
  if (!reminder.dueDate || reminder.completed) return;
  
  const dueDate = new Date(reminder.dueDate);
  const now = new Date();
  
  // Skip past due dates
  if (dueDate <= now) return;
  
  // Schedule notification with a simple timeout
  // In a real-world app, this should use a more robust system like service workers
  const timeUntilDue = dueDate.getTime() - now.getTime();
  
  setTimeout(() => {
    // Check if reminder still exists and isn't completed
    const currentReminder = getReminderById(reminder.id);
    if (!currentReminder || currentReminder.completed) return;
    
    // Show notification if browser supports it
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('תזכורת', {
          body: reminder.title,
          icon: '/logo192.png', // Assuming the app has this favicon
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('תזכורת', {
              body: reminder.title,
              icon: '/logo192.png',
            });
          }
        });
      }
    }
  }, timeUntilDue);
};

// Helper for creating recurring reminders
const createNextRecurringReminder = (completedReminder: Reminder): Reminder => {
  const nextDueDate = getNextRecurringDate(
    new Date(completedReminder.dueDate!), 
    completedReminder.recurringPattern!
  );
  
  return {
    ...completedReminder,
    id: crypto.randomUUID(),
    completed: false,
    completedAt: undefined,
    createdAt: new Date(),
    dueDate: nextDueDate,
  };
};

const getNextRecurringDate = (currentDueDate: Date, pattern: string): Date => {
  const next = new Date(currentDueDate);
  
  switch (pattern) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setDate(next.getDate() + 1);
  }
  
  return next;
};

// Initialize notifications permission
export const initNotifications = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

// Function to handle initial data loading or seeding
export const initReminderService = () => {
  const reminders = loadRemindersFromStorage();
  
  // If no reminders exist, add some sample data
  if (reminders.length === 0) {
    const sampleReminders: Reminder[] = [
      {
        id: crypto.randomUUID(),
        title: 'להשלים את השבוע הראשון במסלול המדיטציה',
        description: 'להתמיד במדיטציות יומיות של 10 דקות',
        completed: false,
        createdAt: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        priority: 'high',
        category: 'בריאות',
        recurring: false,
        tags: ['מדיטציה', 'התמדה'],
      },
      {
        id: crypto.randomUUID(),
        title: 'לקרוא מאמר על נשימה סרעפתית',
        description: 'לחפש מאמר איכותי על טכניקות נשימה והשפעתן על חרדה',
        completed: false,
        createdAt: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        priority: 'medium',
        category: 'לימודים',
        recurring: false,
        tags: ['נשימה', 'חרדה', 'לימוד'],
      },
      {
        id: crypto.randomUUID(),
        title: 'לשתות 2 ליטר מים',
        description: 'לוודא שתייה מספקת של מים לאורך היום',
        completed: false,
        createdAt: new Date(),
        dueDate: new Date(new Date().setHours(20, 0, 0, 0)),
        priority: 'medium',
        category: 'בריאות',
        recurring: true,
        recurringPattern: 'daily',
        tags: ['הרגלים', 'בריאות'],
      },
    ];
    
    saveRemindersToStorage(sampleReminders);
  }
  
  // Schedule notifications for upcoming reminders
  const upcomingReminders = getUpcomingReminders(30); // Next 30 days
  upcomingReminders.forEach(scheduleReminderNotification);
  
  // Request notification permissions
  initNotifications();
};