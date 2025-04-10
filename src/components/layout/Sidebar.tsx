
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Calendar, 
  CreditCard, 
  Dumbbell, 
  LayoutDashboard, 
  LogIn, 
  Settings as SettingsIcon,
  Users,
  Ticket
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => cn(
      "flex items-center gap-x-2 text-sm font-medium px-3 py-2 rounded-md transition-colors",
      isActive 
        ? "bg-primary text-primary-foreground" 
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    )}
  >
    {icon}
    {label}
  </NavLink>
);

export function Sidebar() {
  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard", end: true },
    { to: "/members", icon: <Users className="h-4 w-4" />, label: "Utentes" },
    { to: "/schedules", icon: <Calendar className="h-4 w-4" />, label: "Aulas" },
    { to: "/payments", icon: <CreditCard className="h-4 w-4" />, label: "Pagamentos" },
    { to: "/plans", icon: <Ticket className="h-4 w-4" />, label: "Planos" },
    { to: "/workouts", icon: <Dumbbell className="h-4 w-4" />, label: "Treinos" },
    { to: "/checkin", icon: <LogIn className="h-4 w-4" />, label: "Check-in" },
    { to: "/settings", icon: <SettingsIcon className="h-4 w-4" />, label: "Configurações" },
  ];

  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-6">
        <NavLink to="/" className="flex items-center gap-x-2">
          <Activity className="h-6 w-6" />
          <h1 className="text-xl font-bold">FitLife</h1>
        </NavLink>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-4">
        <nav className="flex flex-col gap-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.to} 
              to={item.to} 
              icon={item.icon} 
              label={item.label}
              end={item.end}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

export default Sidebar;
