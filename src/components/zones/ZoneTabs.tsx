import { RiskZone } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, ShieldOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ZoneTabsProps {
  activeZone: RiskZone;
  onZoneChange: (zone: RiskZone) => void;
  violationCounts: Record<RiskZone, number>;
}

const zoneConfig = {
  low: {
    label: 'Low Risk Zone',
    description: 'Minimal hazards, limited PPE required',
    icon: ShieldOff,
    bgColor: 'bg-success/10 hover:bg-success/20',
    activeColor: 'bg-success text-success-foreground',
    borderColor: 'border-success',
    textColor: 'text-success',
  },
  medium: {
    label: 'Medium Risk Zone',
    description: 'Moderate hazards, configurable PPE',
    icon: Shield,
    bgColor: 'bg-warning/10 hover:bg-warning/20',
    activeColor: 'bg-warning text-warning-foreground',
    borderColor: 'border-warning',
    textColor: 'text-warning',
  },
  high: {
    label: 'High Risk Zone',
    description: 'Critical hazards, full PPE mandatory',
    icon: ShieldAlert,
    bgColor: 'bg-destructive/10 hover:bg-destructive/20',
    activeColor: 'bg-destructive text-destructive-foreground',
    borderColor: 'border-destructive',
    textColor: 'text-destructive',
  },
};

export const ZoneTabs = ({ activeZone, onZoneChange, violationCounts }: ZoneTabsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {(Object.keys(zoneConfig) as RiskZone[]).map((zone) => {
        const config = zoneConfig[zone];
        const Icon = config.icon;
        const isActive = activeZone === zone;
        const violations = violationCounts[zone];

        return (
          <Tooltip key={zone}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onZoneChange(zone)}
                className={cn(
                  'relative flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300',
                  isActive
                    ? `${config.activeColor} ${config.borderColor} shadow-lg scale-[1.02]`
                    : `${config.bgColor} border-transparent`
                )}
              >
                {/* Violation badge */}
                {violations > 0 && (
                  <span className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-bold rounded-full animate-pulse">
                    {violations}
                  </span>
                )}

                <Icon className={cn('h-8 w-8 mb-3', isActive ? '' : config.textColor)} />
                <span className="font-semibold text-sm">{config.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
