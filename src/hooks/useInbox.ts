
import { useState } from 'react';
import { useInboxUtils } from '@/utils/dataUtils';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';

export const useInbox = () => {
  const [input, setInput] = useState('');
  const [minimalistMode, setMinimalistMode] = useState(false);
  const { inboxItems, addInboxItem, updateInboxItem, deleteInboxItem } = useInboxUtils();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    addInboxItem(input.trim());
    setInput('');
    
    toast({
      title: 'Added to inbox',
      description: 'Item was successfully captured.',
    });
  };

  const setPriority = (id: string, priority?: 'high' | 'medium' | 'low') => {
    const item = inboxItems.find(item => item.id === id);
    if (item) {
      updateInboxItem({ ...item, priority });
    }
  };

  const deleteItem = (id: string) => {
    deleteInboxItem(id);
    
    toast({
      title: 'Item deleted',
      description: 'Item was successfully removed from inbox.',
    });
  };

  const convertToTask = (id: string) => {
    // Here we would call the task utility to add a task
    // But for now, let's just mark the item as processed
    const item = inboxItems.find(item => item.id === id);
    if (item) {
      updateInboxItem({ ...item, processed: true });
      
      toast({
        title: 'Converted to task',
        description: 'Inbox item was converted to a task.',
      });
    }
  };

  const addToCalendar = (id: string) => {
    // Here we would call the event utility to add an event
    // But for now, let's just mark the item as processed
    const item = inboxItems.find(item => item.id === id);
    if (item) {
      updateInboxItem({ ...item, processed: true });
      
      toast({
        title: 'Added to calendar',
        description: 'Inbox item was added as an event.',
      });
    }
  };

  const delegateItem = (id: string) => {
    // Here we would open a dialog to select the person to delegate to
    // But for now, let's just show a toast
    toast({
      title: 'Delegation',
      description: 'This feature is coming soon.',
    });
  };

  return {
    input,
    setInput,
    items: inboxItems,
    minimalistMode,
    setMinimalistMode,
    handleSubmit,
    setPriority,
    deleteItem,
    convertToTask,
    addToCalendar,
    delegateItem
  };
};
