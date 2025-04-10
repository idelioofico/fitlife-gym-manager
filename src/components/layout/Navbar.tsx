
import React from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface NavbarProps {
  title?: string;
  toggleSidebar?: () => void;
}

export function Navbar({ title = 'Dashboard' }: NavbarProps) {
  const { toast } = useToast();

  const handleNotificationClick = () => {
    toast({
      title: "Notificações",
      description: "Você não tem notificações novas.",
    });
  };

  const handleProfileAction = (action: string) => {
    toast({
      title: `Ação: ${action}`,
      description: `Você selecionou a ação: ${action}.`,
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center bg-background border-b px-4">
      <div className="flex items-center gap-4 lg:pl-2">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center ml-auto gap-4">
        <div className="hidden md:flex relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Pesquisar..."
            className="pl-8 pr-3 py-2 bg-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationClick}>
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-primary"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleProfileAction("Perfil")}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleProfileAction("Configurações")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleProfileAction("Sair")}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
