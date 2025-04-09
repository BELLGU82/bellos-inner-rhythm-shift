
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-bell-background">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bell-foreground">Welcome back</h1>
            <p className="text-bell-muted">Tuesday, April 9th, 2025</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="neumorph-btn p-3 rounded-full">
              <Bell size={20} className="text-bell-muted" />
            </button>
            <div className="neumorph-sm h-10 w-10 rounded-full flex items-center justify-center">
              <span className="text-bell-primary font-medium">YB</span>
            </div>
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
};

export default Layout;
