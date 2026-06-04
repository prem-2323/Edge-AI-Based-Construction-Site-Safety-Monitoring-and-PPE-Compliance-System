import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  subtitle?: string;
}

export const SummaryCard = ({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default',
  subtitle 
}: SummaryCardProps) => {
  const variants = {
    default: 'bg-card border-border',
    success: 'bg-success/10 border-success/30',
    danger: 'bg-destructive/10 border-destructive/30',
    warning: 'bg-warning/10 border-warning/30',
  };

  const iconVariants = {
    default: 'bg-primary text-primary-foreground',
    success: 'bg-success text-success-foreground',
    danger: 'bg-destructive text-destructive-foreground',
    warning: 'bg-warning text-warning-foreground',
  };

  return (
    <div className={cn(
      "summary-card border animate-fade-in",
      variants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2 text-card-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          iconVariants[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
