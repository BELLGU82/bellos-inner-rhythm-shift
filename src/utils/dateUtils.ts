
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

/**
 * Format a date string to a localized format
 * @param dateString ISO date string
 * @param formatStr Optional format string (default: 'PP')
 * @returns Formatted date string
 */
export const formatDate = (dateString?: string, formatStr = 'PP'): string => {
  if (!dateString) return 'לא הוגדר';
  
  try {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: he });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'תאריך לא תקין';
  }
};

/**
 * Check if a date is in the past
 * @param dateString ISO date string
 * @returns boolean
 */
export const isDatePast = (dateString?: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = parseISO(dateString);
    return date < new Date();
  } catch (error) {
    return false;
  }
};

/**
 * Get relative time text for a date
 * @param dateString ISO date string
 * @returns Text description of relative time
 */
export const getRelativeTimeText = (dateString?: string): string => {
  if (!dateString) return 'לא הוגדר';
  
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `באיחור של ${Math.abs(diffDays)} ימים`;
    } else if (diffDays === 0) {
      return 'היום';
    } else if (diffDays === 1) {
      return 'מחר';
    } else if (diffDays <= 7) {
      return `בעוד ${diffDays} ימים`;
    } else {
      return formatDate(dateString);
    }
  } catch (error) {
    return 'תאריך לא תקין';
  }
};
