import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  CalendarDays,
  Building2,
} from 'lucide-react';
import { useState } from 'react';

const roleNavItems = {
  faculty: [
    { label: 'Dashboard', path: '/faculty', icon: LayoutDashboard },
    { label: 'Submit Report', path: '/faculty/submit-report', icon: FileText },
  ],
  hod: [
    { label: 'Dashboard', path: '/hod', icon: LayoutDashboard },
    { label: 'Subjects', path: '/hod/subjects', icon: FileText },
    { label: 'Timetable', path: '/hod/timetable', icon: CalendarDays },
    { label: 'Faculty List', path: '/hod/faculty', icon: Users },
    { label: 'Lecture Reports', path: '/hod/reports', icon: ClipboardList },
  ],
  registrar: [
    { label: 'Dashboard', path: '/registrar', icon: LayoutDashboard },
    { label: 'Departments', path: '/registrar/branches', icon: Building2 },
    { label: 'All Reports', path: '/registrar/reports', icon: BarChart3 },
  ],
};

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = roleNavItems[user.role];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 rounded-xl flex items-center justify-center">
            <img src="/RU-Logo.png" alt="RU Logo" className="w-full object-contain"/>
          </div>
          <div>
            <h1 className="font-serif text-l font-bold text-sidebar-foreground">Renaissance University</h1>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role} Portal</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mx-4 mt-4 rounded-lg bg-sidebar-accent/50">
        <p className="font-medium text-sidebar-foreground">{user.name}</p>
        <p className="text-xs text-sidebar-foreground/70">{user.department}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-2 left-2 z-50 p-2 rounded-lg bg-primary text-primary-foreground shadow-card"
      >
        {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-72 bg-sidebar transition-transform duration-300 lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
