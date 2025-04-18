
import { v4 as uuidv4 } from 'uuid';
import { parseISO, isAfter, formatDistance } from 'date-fns';
import { he } from 'date-fns/locale';
import { supabase } from '../integrations/supabase/client';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  recurring?: boolean;
  createdAt: string;
}

export const isOverdue = (reminder: Reminder): boolean => {
  if (!reminder.dueDate || reminder.completed) return false;
  const dueDate = typeof reminder.dueDate === 'string' 
    ? parseISO(reminder.dueDate) 
    : reminder.dueDate;
  return isAfter(new Date(), dueDate);
};

export const getDueText = (reminder: Reminder): string => {
  if (!reminder.dueDate) return 'ללא תאריך יעד';
  
  const dueDate = typeof reminder.dueDate === 'string'
    ? parseISO(reminder.dueDate)
    : reminder.dueDate;
  
  return formatDistance(dueDate, new Date(), {
    addSuffix: true,
    locale: he
  });
};

export const getAllReminders = async (): Promise<Reminder[]> => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }
};

export const getOverdueReminders = async (): Promise<Reminder[]> => {
  const reminders = await getAllReminders();
  return reminders.filter(reminder => isOverdue(reminder));
};

export const getTodayReminders = async (): Promise<Reminder[]> => {
  const reminders = await getAllReminders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return reminders.filter(reminder => {
    if (!reminder.dueDate) return false;
    const dueDate = parseISO(reminder.dueDate);
    return dueDate >= today && dueDate < tomorrow;
  });
};

export const getAllCategories = async (): Promise<string[]> => {
  try {
    const reminders = await getAllReminders();
    const categories = reminders
      .map(reminder => reminder.category)
      .filter((category): category is string => 
        category !== undefined && category !== null && category !== ''
      );
    
    return [...new Set(categories)];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const getAllTags = async (): Promise<string[]> => {
  // Placeholder for tag functionality
  return [];
};

export const subscribeToReminders = (
  callback: (reminders: Reminder[]) => void
): (() => void) => {
  // Set up initial data
  getAllReminders().then(callback);
  
  // Set up subscription
  const subscription = supabase
    .channel('reminders-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'reminders' 
    }, () => {
      getAllReminders().then(callback);
    })
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

export const createReminder = async (data: Omit<Reminder, 'id' | 'createdAt'>): Promise<Reminder> => {
  const newReminder: Reminder = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString()
  };

  try {
    const { error } = await supabase
      .from('reminders')
      .insert(newReminder);
    
    if (error) throw error;
    return newReminder;
  } catch (error) {
    console.error('Error creating reminder:', error);
    return newReminder;
  }
};

export const updateReminder = async (reminder: Reminder): Promise<Reminder> => {
  try {
    const { error } = await supabase
      .from('reminders')
      .update(reminder)
      .eq('id', reminder.id);
    
    if (error) throw error;
    return reminder;
  } catch (error) {
    console.error('Error updating reminder:', error);
    return reminder;
  }
};

export const deleteReminder = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return false;
  }
};

export const toggleReminderComplete = async (reminder: Reminder): Promise<Reminder> => {
  const updatedReminder = {
    ...reminder,
    completed: !reminder.completed
  };
  
  return await updateReminder(updatedReminder);
};

export const completeReminder = async (reminder: Reminder): Promise<Reminder> => {
  if (reminder.completed) {
    return reminder;
  }
  
  const completedReminder = {
    ...reminder,
    completed: true
  };
  
  return await updateReminder(completedReminder);
};

export const initializeReminderSystem = async (): Promise<void> => {
  // This would create a table if it doesn't exist
  try {
    // Check if table exists
    const { error } = await supabase
      .from('reminders')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Reminders table may not exist. Creating it...');
      await supabase.rpc('create_reminders_table');
    }
  } catch (error) {
    console.error('Error initializing reminder system:', error);
  }
};

export const processCompletedRecurringReminder = async (reminder: Reminder): Promise<void> => {
  // Placeholder for recurring reminder functionality
  console.log('Processing completed recurring reminder:', reminder);
};

export const scheduleNotification = async (reminderId: string, notificationTime: Date): Promise<boolean> => {
  // Placeholder for notification functionality
  console.log(`Scheduling notification for reminder ${reminderId} at ${notificationTime}`);
  return true;
};
