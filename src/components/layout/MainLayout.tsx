
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <div className={cn(
        "flex flex-col flex-1 min-h-screen transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <Navbar title={title} toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-6">
          {children}
        </main>
        
        <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FitLife Gym Management System</p>
        </footer>
      </div>
    </div>
  );
}
