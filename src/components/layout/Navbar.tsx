import { Bell, User, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  alertCount: number;
  onMenuToggle: () => void;
}

export const Navbar = ({ alertCount, onMenuToggle }: NavbarProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-secondary border-b border-sidebar-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-secondary-foreground hover:bg-sidebar-accent"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-lg font-bold text-secondary-foreground">
              Edge AI-Based Construction Site Safety Monitoring and PPE Compliance System
            </h1>
            <p className="text-xs text-sidebar-foreground hidden sm:block">
              Real-time Construction Site Monitoring
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-secondary-foreground hover:bg-sidebar-accent"
          >
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
                {alertCount}
              </Badge>
            )}
          </Button>
          
          <div className="flex items-center gap-2 pl-3 border-l border-sidebar-border">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-secondary-foreground">John Smith</p>
              <p className="text-xs text-sidebar-foreground">Site Supervisor</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
