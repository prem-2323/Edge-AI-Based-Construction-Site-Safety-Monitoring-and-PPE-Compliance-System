import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useLatestResult } from '@/hooks/use-safety-api';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { result } = useLatestResult();
  const activeAlerts = result?.alerts ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        alertCount={activeAlerts} 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
