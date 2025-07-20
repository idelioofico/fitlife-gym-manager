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
  Ticket,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  DollarSign,
  FileText,
  BarChart3,
  Warehouse,
  Boxes,
  Truck,
  Receipt,
  TrendingUp,
  Package,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
  end?: boolean;
}

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapse?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, collapsed = false, end = false }) => (
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
    <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
      {icon}
      {!collapsed && <span className="ml-2">{label}</span>}
    </div>
  </NavLink>
);

export function Sidebar({ collapsed = false, toggleCollapse }: SidebarProps) {
  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard", end: true },
    { to: "/members", icon: <Users className="h-4 w-4" />, label: "Utentes" },
    { to: "/schedules", icon: <Calendar className="h-4 w-4" />, label: "Aulas" },
    { to: "/payments", icon: <CreditCard className="h-4 w-4" />, label: "Pagamentos" },
    { to: "/billing", icon: <Receipt className="h-4 w-4" />, label: "Faturação" },
    { to: "/plans", icon: <Ticket className="h-4 w-4" />, label: "Planos" },
    { to: "/workouts", icon: <Dumbbell className="h-4 w-4" />, label: "Treinos" },
    { to: "/checkin", icon: <LogIn className="h-4 w-4" />, label: "Check-in" },
    { to: "/pos", icon: <CreditCard className="h-4 w-4" />, label: "POS" },
    { to: "/products", icon: <Package className="h-4 w-4" />, label: "Produtos" },
    { to: "/sales", icon: <History className="h-4 w-4" />, label: "Histórico Vendas" },
    { to: "/sales/reports", icon: <BarChart3 className="h-4 w-4" />, label: "Relatórios Vendas" },
    { to: "/expenses", icon: <Receipt className="h-4 w-4" />, label: "Despesas" },
    { to: "/documents", icon: <FileText className="h-4 w-4" />, label: "Documentos" },
    { to: "/expenses/reports", icon: <TrendingUp className="h-4 w-4" />, label: "Relatórios Financeiros" },
    { to: "/inventory", icon: <Boxes className="h-4 w-4" />, label: "Stock" },
    { to: "/suppliers", icon: <Truck className="h-4 w-4" />, label: "Fornecedores" },
    { to: "/settings", icon: <SettingsIcon className="h-4 w-4" />, label: "Configurações" },
  ];

  return (
    <div className={cn(
      "h-full flex flex-col border-r transition-all duration-300 bg-background",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "p-4 flex items-center", 
        collapsed ? "justify-center" : "justify-between"
      )}>
        <NavLink to="/" className="flex items-center gap-x-2">
          <Activity className="h-6 w-6" />
          {!collapsed && <h1 className="text-xl font-bold">Hefel</h1>}
        </NavLink>
        
        {toggleCollapse && (
          <Button 
            variant="ghost" 
            size="sm" 
            className={collapsed ? "ml-auto" : ""} 
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-3">
        <nav className="flex flex-col gap-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.to} 
              to={item.to} 
              icon={item.icon} 
              label={item.label}
              collapsed={collapsed}
              end={item.end}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

export default Sidebar;
