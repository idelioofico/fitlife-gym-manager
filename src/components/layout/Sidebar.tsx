
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Dumbbell, 
  ClipboardCheck, 
  Settings,
  Home,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed?: boolean;
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

function SidebarItem({ icon: Icon, label, href, active = false }: SidebarItemProps) {
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
          <span>{label}</span>
        </Button>
      </Link>
    </li>
  );
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  // Determine if sidebar should be shown
  const isVisible = !collapsed || isHovered;
  
  return (
    <aside
      className={cn(
        "bg-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border transition-all duration-300",
        collapsed && !isHovered && "w-16"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fitPrimaryLight text-white font-bold">
            FL
          </div>
          {isVisible && <span className="text-lg font-semibold text-sidebar-foreground">FitLife</span>}
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <ul className="grid gap-1">
            <SidebarItem icon={Home} label="Início" href="/" active={true} />
            <SidebarItem icon={BarChart3} label="Dashboard" href="/dashboard" />
            <SidebarItem icon={Users} label="Utentes" href="/members" />
            <SidebarItem icon={CalendarCheck} label="Agendamentos" href="/schedules" />
            <SidebarItem icon={CreditCard} label="Pagamentos" href="/payments" />
            <SidebarItem icon={Dumbbell} label="Treinos" href="/workouts" />
            <SidebarItem icon={ClipboardCheck} label="Check-In" href="/checkin" />
            <SidebarItem icon={Settings} label="Configurações" href="/settings" />
          </ul>
        </nav>
      </div>
      
      <div className="mt-auto border-t border-sidebar-border p-4">
        <Button variant="ghost" className="w-full justify-start gap-3 px-3 font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="h-5 w-5" />
          {isVisible && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
