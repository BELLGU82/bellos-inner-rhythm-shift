
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the basic types for our data
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
  priority?: 'high' | 'medium' | 'low';
}

interface RitualData {
  date: Date;
  focusAreas: string[];
  highestRoiTask: string;
  notDoingItems: string[];
  selectedMode: 'creation' | 'leadership' | 'stillness';
  completed: boolean;
}

// State structure
interface AppState {
  tasks: Task[];
  events: CalendarEvent[];
  documents: Document[];
  inboxItems: InboxItem[];
  rituals: RitualData[];
  isLoading: boolean;
  error: string | null;
}

// Actions
type Action = 
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Document }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'ADD_INBOX_ITEM'; payload: InboxItem }
  | { type: 'UPDATE_INBOX_ITEM'; payload: InboxItem }
  | { type: 'DELETE_INBOX_ITEM'; payload: string }
  | { type: 'SAVE_RITUAL'; payload: RitualData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: AppState = {
  tasks: [],
  events: [],
  documents: [],
  inboxItems: [],
  rituals: [],
  isLoading: false,
  error: null
};

// Reducer function
const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    case 'UPDATE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ) 
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    
    case 'UPDATE_EVENT':
      return { 
        ...state, 
        events: state.events.map(event => 
          event.id === action.payload.id ? action.payload : event
        ) 
      };
    
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload)
      };
    
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] };
    
    case 'UPDATE_DOCUMENT':
      return { 
        ...state, 
        documents: state.documents.map(doc => 
          doc.id === action.payload.id ? action.payload : doc
        ) 
      };
    
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload)
      };
    
    case 'ADD_INBOX_ITEM':
      return { ...state, inboxItems: [...state.inboxItems, action.payload] };
    
    case 'UPDATE_INBOX_ITEM':
      return { 
        ...state, 
        inboxItems: state.inboxItems.map(item => 
          item.id === action.payload.id ? action.payload : item
        ) 
      };
    
    case 'DELETE_INBOX_ITEM':
      return {
        ...state,
        inboxItems: state.inboxItems.filter(item => item.id !== action.payload)
      };
    
    case 'SAVE_RITUAL':
      // Check if ritual for this date already exists
      const existingRitualIndex = state.rituals.findIndex(
        ritual => ritual.date.toDateString() === action.payload.date.toDateString()
      );
      
      if (existingRitualIndex >= 0) {
        // Update existing ritual
        const updatedRituals = [...state.rituals];
        updatedRituals[existingRitualIndex] = action.payload;
        return { ...state, rituals: updatedRituals };
      }
      
      // Add new ritual
      return { ...state, rituals: [...state.rituals, action.payload] };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
};

// Create context
interface DataContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const DataContext = createContext<DataContextType>({
  state: initialState,
  dispatch: () => undefined,
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};

// Utility functions for generating IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

