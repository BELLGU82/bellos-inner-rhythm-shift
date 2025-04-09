// src/services/reminderService.ts
import { v4 as uuidv4 } from 'uuid';

// Define the reminder type
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
  recurringPattern: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  tags: string[];
}

// Local storage key
const REMINDERS_STORAGE_KEY = 'bellosRhythmShiftReminders';

// Helper functions for localStorage
const saveReminders = (reminders: Reminder[]): void => {
  localStorage.setItem(
    REMINDERS_STORAGE_KEY,
    JSON.stringify(reminders, (key, value) => {
      // Convert Date objects to ISO strings for storage
      if (key === 'createdAt' || key === 'dueDate') {
        return value instanceof Date ? value.toISOString() : value;
      }
      return value;
    })
  );
};

const loadReminders = (): Reminder[] => {
  const storedData = localStorage.getItem(REMINDERS_STORAGE_KEY);
  if (!storedData) return [];

  try {
    return JSON.parse(storedData, (key, value) => {
      // Convert ISO date strings back to Date objects
      if (key === 'createdAt' && typeof value === 'string') {
        return new Date(value);
      }
      if (key === 'dueDate' && typeof value === 'string') {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.error('Error parsing reminders from storage:', error);
    return [];
  }
};

// CRUD operations
export const getReminders = (): Reminder[] => {
  return loadReminders();
};

export const getReminderById = (id: string): Reminder | undefined => {
  const reminders = loadReminders();
  return reminders.find(reminder => reminder.id === id);
};

export const addReminder = (reminder: Reminder): Reminder => {
  const reminders = loadReminders();
  
  // Ensure the reminder has an ID
  const newReminder = {
    ...reminder,
    id: reminder.id || uuidv4(),
    createdAt: reminder.createdAt || new Date()
  };
  
  reminders.push(newReminder);
  saveReminders(reminders);
  
  // Notify about upcoming reminders if needed
  scheduleReminderNotification(newReminder);
  
  return newReminder;
};

export const updateReminder = (updatedReminder: Reminder): Reminder => {
  const reminders = loadReminders();
  const index = reminders.findIndex(r => r.id === updatedReminder.id);
  
  if (index !== -1) {
    reminders[index] = updatedReminder;
    saveReminders(reminders);
    
    // Update notification if needed
    scheduleReminderNotification(updatedReminder);
  }
  
  return updatedReminder;
};

export const deleteReminder = (id: string): void => {
  const reminders = loadReminders();
  const filteredReminders = reminders.filter(reminder => reminder.id !== id);
  saveReminders(filteredReminders);
};

export const toggleReminderCompletion = (id: string): Reminder | undefined => {
  const reminders = loadReminders();
  const index = reminders.findIndex(r => r.id === id);
  
  if (index !== -1) {
    reminders[index] = {
      ...reminders[index],
      completed: !reminders[index].completed
    };
    saveReminders(reminders);
    return reminders[index];
  }
  
  return undefined;
};

// Filter functions
export const getUpcomingReminders = (days: number = 7): Reminder[] => {
  const reminders = loadReminders();
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  
  return reminders.filter(reminder => {
    if (!reminder.dueDate || reminder.completed) return false;
    const dueDate = new Date(reminder.dueDate);
    return dueDate >= now && dueDate <= futureDate;
  });
};

export const getOverdueReminders = (): Reminder[] => {
  const reminders = loadReminders();
  const now = new Date();
  
  return reminders.filter(reminder => {
    if (!reminder.dueDate || reminder.completed) return false;
    const dueDate = new Date(reminder.dueDate);
    return dueDate < now;
  });
};

// Notification handling
const scheduleReminderNotification = (reminder: Reminder): void => {
  // Skip if already completed or no due date
  if (reminder.completed || !reminder.dueDate) return;
  
  const dueDate = new Date(reminder.dueDate);
  const now = new Date();
  
  // Skip if already past due
  if (dueDate <= now) return;
  
  // Calculate time until due
  const timeUntilDue = dueDate.getTime() - now.getTime();
  
  // Schedule notification if browser supports it
  if ('Notification' in window && Notification.permission === 'granted') {
    setTimeout(() => {
      new Notification('תזכורת', {
        body: reminder.title,
        icon: '/logo.png' // Replace with app logo
      });
    }, timeUntilDue);
  }
};

// Request notification permissions
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Initialize notifications for existing reminders
export const initializeReminderNotifications = (): void => {
  const reminders = loadReminders();
  reminders.forEach(scheduleReminderNotification);
};

// Export additional utility functions
export const generateRecurringReminders = (): void => {
  const reminders = loadReminders();
  const today = new Date();
  
  const newReminders: Reminder[] = [];
  
  reminders.forEach(reminder => {
    if (!reminder.recurring || !reminder.recurringPattern || !reminder.dueDate) return;
    
    // Only generate new instances if the reminder is completed or due date has passed
    if (reminder.completed || new Date(reminder.dueDate) < today) {
      const newDueDate = calculateNextDueDate(new Date(reminder.dueDate), reminder.recurringPattern);
      
      if (newDueDate) {
        const newReminder: Reminder = {
          ...reminder,
          id: uuidv4(),
          completed: false,
          createdAt: new Date(),
          dueDate: newDueDate
        };
        
        newReminders.push(newReminder);
      }
    }
  });
  
  // Add the new recurring reminders
  if (newReminders.length > 0) {
    saveReminders([...reminders, ...newReminders]);
  }
};

// Helper to calculate next occurrence based on recurring pattern
const calculateNextDueDate = (
  currentDueDate: Date,
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly'
): Date => {
  const nextDate = new Date(currentDueDate);
  
  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
};

// Export default for convenience
export default {
  getReminders,
  getReminderById,
  addReminder,
  updateReminder,
  deleteReminder,
  toggleReminderCompletion,
  getUpcomingReminders,
  getOverdueReminders,
  requestNotificationPermission,
  initializeReminderNotifications,
  generateRecurringReminders
};