
import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} />
      
      <div className="flex flex-col flex-1 min-h-screen">
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
