// src/services/reminderService.ts
import { v4 as uuidv4 } from 'uuid';
import { Category } from '../types/categories';

// Reminder interfaces
export interface Notification {
  id?: string;
  time: string;
  message: string;
  triggered: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  category: string;
  recurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  tags: string[];
  notifications?: Notification[];
}

// Helper functions for localStorage
const getRemindersFromStorage = (): Reminder[] => {
  const remindersJson = localStorage.getItem('reminders');
  return remindersJson ? JSON.parse(remindersJson) : [];
};

const saveRemindersToStorage = (reminders: Reminder[]): void => {
  localStorage.setItem('reminders', JSON.stringify(reminders));
};

// CRUD operations
export const getAllReminders = (): Reminder[] => {
  return getRemindersFromStorage();
};

export const getReminderById = (id: string): Reminder | undefined => {
  const reminders = getRemindersFromStorage();
  return reminders.find(reminder => reminder.id === id);
};

export const createReminder = (reminderData: Omit<Reminder, 'id' | 'createdAt'>): Reminder => {
  const reminders = getRemindersFromStorage();
  
  const newReminder: Reminder = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...reminderData
  };
  
  reminders.push(newReminder);
  saveRemindersToStorage(reminders);
  
  return newReminder;
};

export const updateReminder = (updatedReminder: Reminder): Reminder => {
  const reminders = getRemindersFromStorage();
  
  const reminderIndex = reminders.findIndex(reminder => reminder.id === updatedReminder.id);
  
  if (reminderIndex === -1) {
    throw new Error(`Reminder with id ${updatedReminder.id} not found`);
  }
  
  reminders[reminderIndex] = updatedReminder;
  saveRemindersToStorage(reminders);
  
  return updatedReminder;
};

export const deleteReminder = (id: string): void => {
  let reminders = getRemindersFromStorage();
  
  // Filter out the reminder with the given id
  reminders = reminders.filter(reminder => reminder.id !== id);
  
  saveRemindersToStorage(reminders);
};

export const completeReminder = (id: string, completed: boolean = true): Reminder => {
  const reminders = getRemindersFromStorage();
  
  const reminderIndex = reminders.findIndex(reminder => reminder.id === id);
  
  if (reminderIndex === -1) {
    throw new Error(`Reminder with id ${id} not found`);
  }
  
  const updatedReminder = {
    ...reminders[reminderIndex],
    completed,
    completedAt: completed ? new Date().toISOString() : undefined
  };
  
  reminders[reminderIndex] = updatedReminder;
  saveRemindersToStorage(reminders);
  
  return updatedReminder;
};

// Filter and search functions
export const searchReminders = (query: string): Reminder[] => {
  if (!query) return getAllReminders();
  
  const reminders = getRemindersFromStorage();
  const lowerCaseQuery = query.toLowerCase();
  
  return reminders.filter(reminder =>
    reminder.title.toLowerCase().includes(lowerCaseQuery) ||
    reminder.description.toLowerCase().includes(lowerCaseQuery) ||
    reminder.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
  );
};

export const filterRemindersByStatus = (completed: boolean): Reminder[] => {
  const reminders = getRemindersFromStorage();
  return reminders.filter(reminder => reminder.completed === completed);
};

export const filterRemindersByPriority = (priority: 'high' | 'medium' | 'low'): Reminder[] => {
  const reminders = getRemindersFromStorage();
  return reminders.filter(reminder => reminder.priority === priority);
};

export const filterRemindersByCategory = (category: string): Reminder[] => {
  const reminders = getRemindersFromStorage();
  return reminders.filter(reminder => reminder.category === category);
};

export const filterRemindersByDueDate = (fromDate: Date, toDate?: Date): Reminder[] => {
  const reminders = getRemindersFromStorage().filter(reminder => reminder.dueDate);
  
  return reminders.filter(reminder => {
    if (!reminder.dueDate) return false;
    
    const dueDate = new Date(reminder.dueDate);
    
    if (toDate) {
      return dueDate >= fromDate && dueDate <= toDate;
    }
    
    return dueDate.getDate() === fromDate.getDate() &&
           dueDate.getMonth() === fromDate.getMonth() &&
           dueDate.getFullYear() === fromDate.getFullYear();
  });
};

export const getOverdueReminders = (): Reminder[] => {
  const now = new Date();
  const reminders = getRemindersFromStorage();
  
  return reminders.filter(reminder => 
    !reminder.completed && 
    reminder.dueDate && 
    new Date(reminder.dueDate) < now
  );
};

export const getTodayReminders = (): Reminder[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return filterRemindersByDueDate(today, tomorrow);
};

export const getUpcomingReminders = (days: number = 7): Reminder[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  
  return filterRemindersByDueDate(today, futureDate);
};

// Category management
export const getAllCategories = (): string[] => {
  const categories = localStorage.getItem('reminderCategories');
  
  if (categories) {
    return JSON.parse(categories);
  }
  
  // Default categories
  const defaultCategories = ['כללי', 'עבודה', 'אישי', 'משפחה', 'בריאות', 'קניות'];
  localStorage.setItem('reminderCategories', JSON.stringify(defaultCategories));
  
  return defaultCategories;
};

export const addCategory = (category: string): string[] => {
  const categories = getAllCategories();
  
  if (!categories.includes(category)) {
    categories.push(category);
    localStorage.setItem('reminderCategories', JSON.stringify(categories));
  }
  
  return categories;
};

export const removeCategory = (category: string): string[] => {
  if (category === 'כללי') {
    throw new Error('לא ניתן למחוק את הקטגוריה "כללי"');
  }
  
  let categories = getAllCategories();
  categories = categories.filter(c => c !== category);
  
  localStorage.setItem('reminderCategories', JSON.stringify(categories));
  
  // Update all reminders with this category to 'כללי'
  const reminders = getRemindersFromStorage();
  let hasChanges = false;
  
  reminders.forEach(reminder => {
    if (reminder.category === category) {
      reminder.category = 'כללי';
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    saveRemindersToStorage(reminders);
  }
  
  return categories;
};

// Tag management
export const getAllTags = (): string[] => {
  const tags = localStorage.getItem('reminderTags');
  
  if (tags) {
    return JSON.parse(tags);
  }
  
  return [];
};

export const addTag = (tag: string): string[] => {
  const tags = getAllTags();
  
  if (!tags.includes(tag)) {
    tags.push(tag);
    localStorage.setItem('reminderTags', JSON.stringify(tags));
  }
  
  return tags;
};

export const removeTag = (tag: string): string[] => {
  let tags = getAllTags();
  tags = tags.filter(t => t !== tag);
  
  localStorage.setItem('reminderTags', JSON.stringify(tags));
  
  // Remove this tag from all reminders
  const reminders = getRemindersFromStorage();
  let hasChanges = false;
  
  reminders.forEach(reminder => {
    if (reminder.tags.includes(tag)) {
      reminder.tags = reminder.tags.filter(t => t !== tag);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    saveRemindersToStorage(reminders);
  }
  
  return tags;
};

// Notification functionality
export const scheduleNotification = (notification: Notification): void => {
  // This is a mock implementation that would be replaced with actual
  // notification API code in a real application
  
  if (!notification.id) {
    notification.id = uuidv4();
  }
  
  const notificationTime = new Date(notification.time);
  const now = new Date();
  
  if (notificationTime > now) {
    const timeUntilNotification = notificationTime.getTime() - now.getTime();
    
    // Store pending notifications
    const pendingNotifications = JSON.parse(localStorage.getItem('pendingNotifications') || '[]');
    pendingNotifications.push(notification);
    localStorage.setItem('pendingNotifications', JSON.stringify(pendingNotifications));
    
    // In a browser environment, we could use setTimeout for demonstration
    // In a real app, we would use system notifications
    console.log(`Notification "${notification.message}" scheduled for ${notificationTime.toLocaleString()}`);
    
    // This is just for demonstration, in reality we would use a service worker 
    // or native app notifications
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(notification.message);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.message);
          }
        });
      }
      
      // Mark as triggered
      const pendingNotificationsUpdate = JSON.parse(localStorage.getItem('pendingNotifications') || '[]');
      const index = pendingNotificationsUpdate.findIndex((n: Notification) => n.id === notification.id);
      
      if (index !== -1) {
        pendingNotificationsUpdate[index].triggered = true;
        localStorage.setItem('pendingNotifications', JSON.stringify(pendingNotificationsUpdate));
      }
    }, timeUntilNotification);
  }
};

export const checkForMissedNotifications = (): void => {
  const pendingNotifications = JSON.parse(localStorage.getItem('pendingNotifications') || '[]');
  const now = new Date();
  
  pendingNotifications.forEach((notification: Notification) => {
    const notificationTime = new Date(notification.time);
    
    if (!notification.triggered && notificationTime <= now) {
      if (Notification.permission === 'granted') {
        new Notification(`${notification.message} (התראה שהוחמצה)`);
      }
      
      notification.triggered = true;
    }
  });
  
  localStorage.setItem('pendingNotifications', JSON.stringify(pendingNotifications));
};

// Initialize system
export const initializeReminderSystem = (): void => {
  // Check for missed notifications
  checkForMissedNotifications();
  
  // Request notification permission
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
  
  // Generate sample data if none exists
  const reminders = getRemindersFromStorage();
  
  if (reminders.length === 0) {
    // Add some sample reminders
    const sampleReminders: Omit<Reminder, 'id' | 'createdAt'>[] = [
      {
        title: 'לקבוע תור לרופא',
        description: 'לקבוע תור למעקב שנתי אצל רופא המשפחה',
        completed: false,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        priority: 'high',
        category: 'בריאות',
        recurring: true,
        recurringPattern: 'yearly',
        tags: ['בריאות', 'רופא']
      },
      {
        title: 'קניות בסופר',
        description: 'לקנות: חלב, ביצים, לחם, ירקות וירקות',
        completed: false,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        priority: 'medium',
        category: 'קניות',
        recurring: true,
        recurringPattern: 'weekly',
        tags: ['קניות', 'מזון']
      },
      {
        title: 'פגישת צוות',
        description: 'פגישת צוות שבועית לדיון בהתקדמות הפרויקט',
        completed: false,
        dueDate: new Date(new Date().setHours(new Date().getHours() + 24)).toISOString(),
        priority: 'medium',
        category: 'עבודה',
        recurring: true,
        recurringPattern: 'weekly',
        tags: ['עבודה', 'פגישות']
      }
    ];
    
    sampleReminders.forEach(reminder => createReminder(reminder));
  }
};

// Export recurring reminder functions
export const createRecurringInstance = (reminder: Reminder): Reminder => {
  if (!reminder.recurring || !reminder.recurringPattern || !reminder.dueDate) {
    throw new Error('לא ניתן ליצור מופע חדש מתזכורת שאינה חוזרת');
  }
  
  const dueDate = new Date(reminder.dueDate);
  let nextDueDate = new Date(dueDate);
  
  // Calculate next occurrence based on pattern
  switch (reminder.recurringPattern) {
    case 'daily':
      nextDueDate.setDate(dueDate.getDate() + 1);
      break;
    case 'weekly':
      nextDueDate.setDate(dueDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDueDate.setDate(dueDate.getDate() + 14);
      break;
    case 'monthly':
      nextDueDate.setMonth(dueDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDueDate.setFullYear(dueDate.getFullYear() + 1);
      break;
  }
  
  // Create new instance with updated date
  const newInstance: Omit<Reminder, 'id' | 'createdAt'> = {
    ...reminder,
    completed: false,
    completedAt: undefined,
    dueDate: nextDueDate.toISOString()
  };
  
  // Update notifications if they exist
  if (reminder.notifications && reminder.notifications.length > 0) {
    const timeDiff = nextDueDate.getTime() - dueDate.getTime();
    
    newInstance.notifications = reminder.notifications.map(notification => {
      const oldTime = new Date(notification.time);
      const newTime = new Date(oldTime.getTime() + timeDiff);
      
      return {
        time: newTime.toISOString(),
        message: notification.message,
        triggered: false
      };
    });
  }
  
  return createReminder(newInstance);
};

// Handle completed recurring reminders
export const processCompletedRecurringReminder = (reminder: Reminder): void => {
  if (reminder.completed && reminder.recurring && reminder.dueDate) {
    createRecurringInstance(reminder);
  }
};