// src/services/reminderService.ts
import { v4 as uuidv4 } from 'uuid';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  completed: boolean;
  recurring: boolean;
  createdAt: Date;
}

// Key for localStorage
const REMINDERS_STORAGE_KEY = 'remindersClock';

// Initialize from localStorage or empty array
let reminders: Reminder[] = loadReminders();

// Load reminders from localStorage
function loadReminders(): Reminder[] {
  try {
    const savedData = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!savedData) return [];
    
    const parsedData = JSON.parse(savedData);
    
    // Convert string dates back to Date objects
    return parsedData.map((reminder: any) => ({
      ...reminder,
      dueDate: reminder.dueDate ? new Date(reminder.dueDate) : null,
      createdAt: new Date(reminder.createdAt)
    }));
  } catch (error) {
    console.error('Error loading reminders:', error);
    return [];
  }
}

// Save reminders to localStorage
function saveReminders() {
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error('Error saving reminders:', error);
  }
}

// Get all reminders
export function getReminders(): Reminder[] {
  return [...reminders];
}

// Get active (not completed) reminders
export function getActiveReminders(): Reminder[] {
  return reminders.filter(reminder => !reminder.completed);
}

// Get completed reminders
export function getCompletedReminders(): Reminder[] {
  return reminders.filter(reminder => reminder.completed);
}

// Get reminders due today
export function getTodayReminders(): Reminder[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return reminders.filter(reminder => {
    if (!reminder.dueDate) return false;
    const dueDate = new Date(reminder.dueDate);
    return dueDate >= today && dueDate < tomorrow;
  });
}

// Get upcoming reminders (due after today)
export function getUpcomingReminders(): Reminder[] {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return reminders.filter(reminder => {
    if (!reminder.dueDate) return false;
    return new Date(reminder.dueDate) >= tomorrow;
  });
}

// Add a new reminder
export function addReminder(data: Omit<Reminder, 'id' | 'completed' | 'createdAt'>): Reminder {
  const newReminder: Reminder = {
    id: uuidv4(),
    ...data,
    completed: false,
    createdAt: new Date()
  };
  
  reminders.push(newReminder);
  saveReminders();
  
  return newReminder;
}

// Update an existing reminder
export function updateReminder(id: string, data: Partial<Omit<Reminder, 'id'>>): Reminder | null {
  const index = reminders.findIndex(reminder => reminder.id === id);
  if (index === -1) return null;
  
  const updatedReminder = {
    ...reminders[index],
    ...data
  };
  
  reminders[index] = updatedReminder;
  saveReminders();
  
  return updatedReminder;
}

// Toggle reminder completion status
export function toggleReminderCompletion(id: string): Reminder | null {
  const reminder = reminders.find(r => r.id === id);
  if (!reminder) return null;
  
  reminder.completed = !reminder.completed;
  saveReminders();
  
  return reminder;
}

// Delete a reminder
export function deleteReminder(id: string): boolean {
  const initialLength = reminders.length;
  reminders = reminders.filter(reminder => reminder.id !== id);
  
  if (reminders.length !== initialLength) {
    saveReminders();
    return true;
  }
  
  return false;
}

// Clear all completed reminders
export function clearCompletedReminders(): number {
  const initialLength = reminders.length;
  reminders = reminders.filter(reminder => !reminder.completed);
  
  const deletedCount = initialLength - reminders.length;
  if (deletedCount > 0) {
    saveReminders();
  }
  
  return deletedCount;
}

// Search reminders
export function searchReminders(query: string): Reminder[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return reminders;
  
  return reminders.filter(reminder => {
    return (
      reminder.title.toLowerCase().includes(searchTerm) ||
      (reminder.description && reminder.description.toLowerCase().includes(searchTerm)) ||
      (reminder.category && reminder.category.toLowerCase().includes(searchTerm))
    );
  });
}

// Get urgent reminders (high priority and due soon)
export function getUrgentReminders(): Reminder[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return reminders.filter(reminder => {
    if (!reminder.dueDate || reminder.completed) return false;
    
    const isDueSoon = new Date(reminder.dueDate) <= tomorrow;
    const isHighPriority = reminder.priority === 'high';
    
    return isHighPriority && isDueSoon;
  });
}