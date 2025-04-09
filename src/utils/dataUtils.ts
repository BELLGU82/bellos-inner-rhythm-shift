
import { useData, generateId } from '@/contexts/DataContext';

// Task utils
export const useTaskUtils = () => {
  const { state, dispatch } = useData();

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = {
      id: generateId(),
      ...task
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    return newTask;
  };

  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const getTaskById = (id: string) => {
    return state.tasks.find(task => task.id === id) || null;
  };

  const getHighPriorityTasks = () => {
    return state.tasks.filter(task => task.priority === 'high' && !task.completed);
  };

  const getTasksByRoi = (limit = 5) => {
    return [...state.tasks]
      .filter(task => !task.completed && task.roi !== undefined)
      .sort((a, b) => (b.roi || 0) - (a.roi || 0))
      .slice(0, limit);
  };

  return {
    tasks: state.tasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    getHighPriorityTasks,
    getTasksByRoi
  };
};

// Event utils
export const useEventUtils = () => {
  const { state, dispatch } = useData();

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = {
      id: generateId(),
      ...event
    };
    dispatch({ type: 'ADD_EVENT', payload: newEvent });
    return newEvent;
  };

  const updateEvent = (event: CalendarEvent) => {
    dispatch({ type: 'UPDATE_EVENT', payload: event });
  };

  const deleteEvent = (id: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: id });
  };

  const getEventById = (id: string) => {
    return state.events.find(event => event.id === id) || null;
  };

  const getEventsByDateRange = (start: Date, end: Date) => {
    return state.events.filter(event => 
      event.start >= start && event.end <= end
    );
  };

  return {
    events: state.events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventsByDateRange
  };
};

// Document utils
export const useDocumentUtils = () => {
  const { state, dispatch } = useData();

  const addDocument = (document: Omit<Document, 'id'>) => {
    const newDocument = {
      id: generateId(),
      ...document
    };
    dispatch({ type: 'ADD_DOCUMENT', payload: newDocument });
    return newDocument;
  };

  const updateDocument = (document: Document) => {
    dispatch({ type: 'UPDATE_DOCUMENT', payload: document });
  };

  const deleteDocument = (id: string) => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: id });
  };

  const getDocumentById = (id: string) => {
    return state.documents.find(doc => doc.id === id) || null;
  };

  const getDocumentsByTag = (tag: string) => {
    return state.documents.filter(doc => doc.tags.includes(tag));
  };

  const searchDocuments = (query: string) => {
    const searchLower = query.toLowerCase();
    return state.documents.filter(doc => 
      doc.name.toLowerCase().includes(searchLower) || 
      doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  };

  return {
    documents: state.documents,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocumentById,
    getDocumentsByTag,
    searchDocuments
  };
};

// Inbox utils
export const useInboxUtils = () => {
  const { state, dispatch } = useData();

  const addInboxItem = (content: string) => {
    const newItem = {
      id: generateId(),
      content,
      timestamp: new Date(),
      processed: false
    };
    dispatch({ type: 'ADD_INBOX_ITEM', payload: newItem });
    return newItem;
  };

  const updateInboxItem = (item: InboxItem) => {
    dispatch({ type: 'UPDATE_INBOX_ITEM', payload: item });
  };

  const deleteInboxItem = (id: string) => {
    dispatch({ type: 'DELETE_INBOX_ITEM', payload: id });
  };

  const markAsProcessed = (id: string) => {
    const item = state.inboxItems.find(item => item.id === id);
    if (item) {
      updateInboxItem({ ...item, processed: true });
    }
  };

  const getUnprocessedItems = () => {
    return state.inboxItems.filter(item => !item.processed);
  };

  return {
    inboxItems: state.inboxItems,
    addInboxItem,
    updateInboxItem,
    deleteInboxItem,
    markAsProcessed,
    getUnprocessedItems
  };
};

// Ritual utils
export const useRitualUtils = () => {
  const { state, dispatch } = useData();

  const saveRitual = (ritual: Omit<RitualData, 'date' | 'completed'>, completed = true) => {
    const newRitual = {
      date: new Date(),
      ...ritual,
      completed
    };
    dispatch({ type: 'SAVE_RITUAL', payload: newRitual });
    return newRitual;
  };

  const getTodayRitual = () => {
    const today = new Date().toDateString();
    return state.rituals.find(ritual => 
      ritual.date.toDateString() === today
    ) || null;
  };

  const hasCompletedTodayRitual = () => {
    const todayRitual = getTodayRitual();
    return !!todayRitual?.completed;
  };

  return {
    rituals: state.rituals,
    saveRitual,
    getTodayRitual,
    hasCompletedTodayRitual
  };
};

// Missing type definitions
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'high' | 'medium' | 'low';
  completed: boolean;
  roi?: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  category?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  tags: string[];
  uploadDate: Date;
}

interface InboxItem {
  id: string;
  content: string;
  timestamp: Date;
  processed: boolean;
}

interface RitualData {
  date: Date;
  focusAreas: string[];
  highestRoiTask: string;
  notDoingItems: string[];
  selectedMode: 'creation' | 'leadership' | 'stillness';
  completed: boolean;
}
