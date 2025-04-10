
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Dumbbell, 
  ClipboardCheck, 
  Settings,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  collapsed: boolean;
}

function SidebarItem({ icon: Icon, label, href, active = false, collapsed }: SidebarItemProps) {
  return (
    <li>
      <Link to={href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 px-3 font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            active && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
          {!collapsed && <span>{label}</span>}
        </Button>
      </Link>
    </li>
  );
}

export function Sidebar({ collapsed, toggleCollapse }: SidebarProps) {
  const location = useLocation();
  
  return (
    <aside
      className={cn(
        "bg-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fitPrimaryLight text-white font-bold">
            FL
          </div>
          {!collapsed && <span className="text-lg font-semibold text-sidebar-foreground">FitLife</span>}
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleCollapse} 
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <ul className="grid gap-1">
            <SidebarItem icon={Home} label="Início" href="/" active={location.pathname === '/'} collapsed={collapsed} />
            <SidebarItem icon={BarChart3} label="Dashboard" href="/dashboard" active={location.pathname === '/dashboard'} collapsed={collapsed} />
            <SidebarItem icon={Users} label="Utentes" href="/members" active={location.pathname === '/members'} collapsed={collapsed} />
            <SidebarItem icon={CalendarCheck} label="Agendamentos" href="/schedules" active={location.pathname === '/schedules'} collapsed={collapsed} />
            <SidebarItem icon={CreditCard} label="Pagamentos" href="/payments" active={location.pathname === '/payments'} collapsed={collapsed} />
            <SidebarItem icon={Dumbbell} label="Treinos" href="/workouts" active={location.pathname === '/workouts'} collapsed={collapsed} />
            <SidebarItem icon={ClipboardCheck} label="Check-In" href="/checkin" active={location.pathname === '/checkin'} collapsed={collapsed} />
            <SidebarItem icon={Settings} label="Configurações" href="/settings" active={location.pathname === '/settings'} collapsed={collapsed} />
          </ul>
        </nav>
      </div>
      
      <div className="mt-auto border-t border-sidebar-border p-4">
        <Button variant="ghost" className="w-full justify-start gap-3 px-3 font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
