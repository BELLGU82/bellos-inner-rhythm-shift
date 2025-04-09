
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  ListChecks, 
  BarChart3, 
  Users, 
  Brain, 
  HeartPulse, 
  Timer 
} from 'lucide-react';

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
};

const SidebarItem = ({ icon, label, to, active }: SidebarItemProps) => {
  return (
    <Link to={to} className={`bell-sidebar-item ${active ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  // This would be determined by the current route in a real app
  const currentPath = '/';

  return (
    <aside className="neumorph-sm w-64 p-4 flex flex-col h-screen">
      <div className="mb-8 p-2">
        <h1 className="text-2xl font-bold text-bell-primary">BellOS</h1>
        <p className="text-sm text-bell-muted">Leadership Operating System</p>
      </div>
      
      <nav className="space-y-2 flex-1">
        <SidebarItem 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          to="/" 
          active={currentPath === '/'}
        />
        <SidebarItem 
          icon={<Brain size={20} />} 
          label="Identity Core" 
          to="/identity" 
          active={currentPath === '/identity'}
        />
        <SidebarItem 
          icon={<BarChart3 size={20} />} 
          label="ROI Task Ladder" 
          to="/tasks" 
          active={currentPath === '/tasks'}
        />
        <SidebarItem 
          icon={<Calendar size={20} />} 
          label="Bellendar" 
          to="/calendar" 
          active={currentPath === '/calendar'}
        />
        <SidebarItem 
          icon={<Clock size={20} />} 
          label="Smart Clock" 
          to="/clock" 
          active={currentPath === '/clock'}
        />
        <SidebarItem 
          icon={<ListChecks size={20} />} 
          label="Process Map" 
          to="/process" 
          active={currentPath === '/process'}
        />
        <SidebarItem 
          icon={<Users size={20} />} 
          label="Delegation" 
          to="/delegation" 
          active={currentPath === '/delegation'}
        />
        <SidebarItem 
          icon={<HeartPulse size={20} />} 
          label="BellRest" 
          to="/rest" 
          active={currentPath === '/rest'}
        />
        <SidebarItem 
          icon={<Timer size={20} />} 
          label="Pomodoro" 
          to="/pomodoro" 
          active={currentPath === '/pomodoro'}
        />
      </nav>
      
      <div className="neumorph-inner mt-auto p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="neumorph-sm h-10 w-10 rounded-full flex items-center justify-center">
            <span className="text-bell-primary font-medium">YB</span>
          </div>
          <div>
            <p className="text-sm font-medium">Your Brand</p>
            <p className="text-xs text-bell-muted">Visionary CEO</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
