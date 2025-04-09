
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  ListChecks, 
  BarChart3, 
  Users, 
  Brain, 
  HeartPulse, 
  Timer,
  FileText,
  Crown,
  Inbox as InboxIcon,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  collapsed?: boolean;
};

const SidebarItem = ({ icon, label, to, active, collapsed }: SidebarItemProps) => {
  return (
    <Link to={to} className={`bell-sidebar-item ${active ? 'active' : ''}`}>
      <div className="flex items-center">
        {icon}
        {!collapsed && <span className="transition-all duration-300">{label}</span>}
      </div>
    </Link>
  );
};

const Sidebar = () => {
  // Use the location hook to determine the current path
  const location = useLocation();
  const currentPath = location.pathname;
  const [collapsed, setCollapsed] = React.useState(false);
  const isMobile = useIsMobile();
  
  // Check window width on mount and when resized
  React.useEffect(() => {
    const handleResize = () => {
      // Tablet breakpoint (768px to 1024px)
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      setCollapsed(isTablet);
    };
    
    // Initial check
    handleResize();
    
    // Set up listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside className={`neumorph-sm p-4 flex flex-col h-screen transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="mb-8 p-2 flex items-center justify-between">
        {!collapsed && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-bell-primary">BellOS</h1>
              <p className="text-sm text-bell-muted">Leadership OS</p>
            </div>
          </>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <h1 className="text-2xl font-bold text-bell-primary">B</h1>
          </div>
        )}
        <button 
          onClick={toggleCollapsed} 
          className="neumorph-btn p-2 rounded-full text-bell-muted hover:text-bell-primary"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      <nav className="space-y-2 flex-1">
        <SidebarItem 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          to="/" 
          active={currentPath === '/'}
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={<Brain size={20} />} 
          label="Identity Core" 
          to="/identity" 
          active={currentPath === '/identity'}
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={<BarChart3 size={20} />} 
          label="ROI Task Ladder" 
          to="/tasks" 
          active={currentPath === '/tasks'}
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={<Calendar size={20} />} 
          label="Bellendar" 
          to="/calendar" 
          active={currentPath === '/calendar'}
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={<Clock size={20} />} 
          label="Smart Clock" 
          to="/clock" 
          active={currentPath === '/clock'}
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={<ListChecks size={20} />} 
          label="Process Map" 
          to="/process" 
          active={currentPath === '/process'}
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={<Users size={20} />} 
          label="Delegation" 
          to="/delegation" 
          active={currentPath === '/delegation'}
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={<HeartPulse size={20} />} 
          label="BellRest" 
          to="/rest" 
          active={currentPath === '/rest'}
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={<Timer size={20} />} 
          label="Pomodoro" 
          to="/pomodoro" 
          active={currentPath === '/pomodoro'}
          collapsed={collapsed}
        />
        
        {/* Added New Pages */}
        <SidebarItem 
          icon={<FileText size={20} />} 
          label="Documents" 
          to="/documents" 
          active={currentPath === '/documents'}
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={<Crown size={20} />} 
          label="CEO Ritual" 
          to="/ritual" 
          active={currentPath === '/ritual'}
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={<InboxIcon size={20} />} 
          label="Inbox" 
          to="/inbox" 
          active={currentPath === '/inbox'}
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={<SettingsIcon size={20} />} 
          label="Settings" 
          to="/settings" 
          active={currentPath === '/settings'}
          collapsed={collapsed}
        />
      </nav>
      
      <div className={`neumorph-inner mt-auto p-4 rounded-xl ${collapsed ? 'py-3 px-2' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="neumorph-sm h-10 w-10 rounded-full flex items-center justify-center">
            <span className="text-bell-primary font-medium">YB</span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium">Your Brand</p>
              <p className="text-xs text-bell-muted">Visionary CEO</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
