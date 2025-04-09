// Reminder Service
// This service manages reminders for the Smart Clock

import { v4 as uuidv4 } from 'uuid';

export interface Reminder {
  id: string;
  text: string;
  dateTime: Date;
  isCompleted: boolean;
  isRepeating: boolean;
  repeatPattern?: RepeatPattern;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
  notificationSent?: boolean;
}

export type RepeatPattern = {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  dayOfMonth?: number;
  monthOfYear?: number;
  customInterval?: {
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
    value: number;
  };
};

export const LOCAL_STORAGE_KEY = 'bellsInnerRhythmReminders';

export class ReminderService {
  private reminders: Reminder[] = [];
  private subscribers: ((reminders: Reminder[]) => void)[] = [];

  constructor() {
    this.loadReminders();
  }

  // Load reminders from localStorage
  private loadReminders(): void {
    if (typeof window === 'undefined') return;

    const savedReminders = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedReminders) {
      try {
        const parsedReminders = JSON.parse(savedReminders);
        this.reminders = parsedReminders.map((reminder: any) => ({
          ...reminder,
          dateTime: new Date(reminder.dateTime)
        }));
      } catch (error) {
        console.error('Failed to parse reminders from localStorage:', error);
        this.reminders = [];
      }
    }
  }

  // Save reminders to localStorage
  private saveReminders(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.reminders));
    this.notifySubscribers();
  }

  // Get all reminders
  public getReminders(): Reminder[] {
    return [...this.reminders].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }

  // Get reminders for today
  public getTodayReminders(): Reminder[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.reminders.filter(reminder => {
      const reminderDate = new Date(reminder.dateTime);
      return reminderDate >= today && reminderDate < tomorrow;
    }).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }

  // Get upcoming reminders (within the next 7 days)
  public getUpcomingReminders(days: number = 7): Reminder[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.reminders.filter(reminder => {
      const reminderDate = new Date(reminder.dateTime);
      return reminderDate >= today && reminderDate < futureDate;
    }).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }

  // Add a new reminder
  public addReminder(reminder: Omit<Reminder, 'id'>): Reminder {
    const newReminder: Reminder = {
      ...reminder,
      id: uuidv4(),
    };
    
    this.reminders.push(newReminder);
    this.saveReminders();
    return newReminder;
  }

  // Add a quick reminder (with minimal data)
  public addQuickReminder(text: string, dateTime: Date): Reminder {
    return this.addReminder({
      text,
      dateTime,
      isCompleted: false,
      isRepeating: false,
      priority: 'medium',
      tags: [],
    });
  }

  // Update an existing reminder
  public updateReminder(id: string, updates: Partial<Omit<Reminder, 'id'>>): Reminder | null {
    const index = this.reminders.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    const updatedReminder = { 
      ...this.reminders[index], 
      ...updates 
    };
    
    this.reminders[index] = updatedReminder;
    this.saveReminders();
    return updatedReminder;
  }

  // Delete a reminder
  public deleteReminder(id: string): boolean {
    const initialLength = this.reminders.length;
    this.reminders = this.reminders.filter(r => r.id !== id);
    
    if (this.reminders.length !== initialLength) {
      this.saveReminders();
      return true;
    }
    
    return false;
  }

  // Mark a reminder as completed
  public completeReminder(id: string): Reminder | null {
    const reminder = this.reminders.find(r => r.id === id);
    if (!reminder) return null;
    
    reminder.isCompleted = true;
    
    // If it's a repeating reminder, create the next occurrence
    if (reminder.isRepeating && reminder.repeatPattern) {
      this.createNextOccurrence(reminder);
    }
    
    this.saveReminders();
    return reminder;
  }

  // Create the next occurrence of a repeating reminder
  private createNextOccurrence(reminder: Reminder): void {
    if (!reminder.repeatPattern) return;
    
    const nextDate = this.calculateNextOccurrence(reminder.dateTime, reminder.repeatPattern);
    
    if (nextDate) {
      const newReminder: Reminder = {
        ...reminder,
        id: uuidv4(),
        dateTime: nextDate,
        isCompleted: false,
        notificationSent: false,
      };
      
      this.reminders.push(newReminder);
    }
  }

  // Calculate the next occurrence date based on repeat pattern
  private calculateNextOccurrence(currentDate: Date, pattern: RepeatPattern): Date | null {
    const nextDate = new Date(currentDate);
    
    switch (pattern.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        return nextDate;
        
      case 'weekly':
        // If specific days are set, find the next occurrence
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          const currentDay = currentDate.getDay();
          const nextDays = pattern.daysOfWeek.filter(day => day > currentDay);
          
          if (nextDays.length > 0) {
            // There's a remaining day this week
            const daysToAdd = nextDays[0] - currentDay;
            nextDate.setDate(nextDate.getDate() + daysToAdd);
          } else {
            // Move to the first day of next week
            const daysToAdd = 7 - currentDay + pattern.daysOfWeek[0];
            nextDate.setDate(nextDate.getDate() + daysToAdd);
          }
          return nextDate;
        }
        
        // Default to one week later
        nextDate.setDate(nextDate.getDate() + 7);
        return nextDate;
        
      case 'monthly':
        if (pattern.dayOfMonth) {
          nextDate.setMonth(nextDate.getMonth() + 1);
          nextDate.setDate(Math.min(pattern.dayOfMonth, this.getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth())));
          return nextDate;
        }
        
        // Default to same day next month
        nextDate.setMonth(nextDate.getMonth() + 1);
        return nextDate;
        
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        return nextDate;
        
      case 'custom':
        if (pattern.customInterval) {
          const { unit, value } = pattern.customInterval;
          
          switch (unit) {
            case 'minutes':
              nextDate.setMinutes(nextDate.getMinutes() + value);
              break;
            case 'hours':
              nextDate.setHours(nextDate.getHours() + value);
              break;
            case 'days':
              nextDate.setDate(nextDate.getDate() + value);
              break;
            case 'weeks':
              nextDate.setDate(nextDate.getDate() + (value * 7));
              break;
            case 'months':
              nextDate.setMonth(nextDate.getMonth() + value);
              break;
          }
          
          return nextDate;
        }
        return null;
        
      default:
        return null;
    }
  }

  // Helper function to get the number of days in a month
  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  // Find reminders by text (partial or complete match)
  public findRemindersByText(text: string): Reminder[] {
    const searchTerm = text.toLowerCase();
    return this.reminders.filter(reminder => 
      reminder.text.toLowerCase().includes(searchTerm)
    );
  }

  // Subscribe to changes
  public subscribe(callback: (reminders: Reminder[]) => void): () => void {
    this.subscribers.push(callback);
    
    // Call the callback immediately with current state
    callback(this.getReminders());
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers of changes
  private notifySubscribers(): void {
    const reminders = this.getReminders();
    this.subscribers.forEach(callback => callback(reminders));
  }

  // Check for due reminders that need notifications
  public checkDueReminders(): Reminder[] {
    const now = new Date();
    const dueReminders = this.reminders.filter(reminder => {
      // Only check reminders that haven't been completed or already notified
      if (reminder.isCompleted || reminder.notificationSent) {
        return false;
      }
      
      const reminderTime = new Date(reminder.dateTime);
      return reminderTime <= now;
    });
    
    // Mark these reminders as notified
    dueReminders.forEach(reminder => {
      const index = this.reminders.findIndex(r => r.id === reminder.id);
      if (index !== -1) {
        this.reminders[index].notificationSent = true;
      }
    });
    
    if (dueReminders.length > 0) {
      this.saveReminders();
    }
    
    return dueReminders;
  }

  // Get reminders by priority
  public getRemindersByPriority(priority: 'low' | 'medium' | 'high'): Reminder[] {
    return this.reminders.filter(reminder => reminder.priority === priority)
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }

  // Get reminders by category
  public getRemindersByCategory(category: string): Reminder[] {
    return this.reminders.filter(reminder => reminder.category === category)
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }

  // Get reminders by tag
  public getRemindersByTag(tag: string): Reminder[] {
    return this.reminders.filter(reminder => 
      reminder.tags && reminder.tags.includes(tag)
    ).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }
}

// Create and export a singleton instance
export const reminderService = new ReminderService();
export default reminderService;