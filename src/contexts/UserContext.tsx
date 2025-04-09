
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// This will be expanded when we add Supabase
interface User {
  id: string;
  email: string;
  name: string;
  preferences?: {
    language?: string;
    theme?: string;
    notificationsEnabled?: boolean;
  };
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: () => {},
  updateUserPreferences: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading user data from localStorage (placeholder for Supabase)
    const loadUser = () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('bellOS-user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Save user data when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('bellOS-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bellOS-user');
    }
  }, [user]);
  
  const updateUserPreferences = (preferences: Partial<User['preferences']>) => {
    if (!user) return;
    
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      }
    });
  };
  
  return (
    <UserContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated: !!user, 
        setUser, 
        updateUserPreferences 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
