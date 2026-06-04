import { MapPin, AlertTriangle, CheckCircle, Shield, ShieldAlert, ShieldOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Camera, RiskZone, PPEItem } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CameraCardProps {
  camera: Camera;
  onClick?: () => void;
  requiredPPE?: PPEItem[];
  showZoneBadge?: boolean;
}

const zoneStyles = {
  low: {
    accent: 'border-l-success',
    badge: 'bg-success/20 text-success border-success/30',
    icon: ShieldOff,
    label: 'Low Risk',
  },
  medium: {
    accent: 'border-l-warning',
    badge: 'bg-warning/20 text-warning border-warning/30',
    icon: Shield,
    label: 'Medium Risk',
  },
  high: {
    accent: 'border-l-destructive',
    badge: 'bg-destructive/20 text-destructive border-destructive/30',
    icon: ShieldAlert,
    label: 'High Risk',
  },
};

export const CameraCard = ({ camera, onClick, requiredPPE = [], showZoneBadge = true }: CameraCardProps) => {
  const isViolation = camera.status === 'violation';
  const zone = camera.zone || 'low';
  const zoneStyle = zoneStyles[zone];
  const ZoneIcon = zoneStyle.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-card rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer animate-fade-in border-l-4",
        "hover:shadow-lg hover:-translate-y-1",
        isViolation 
          ? "camera-violation animate-pulse-violation border-l-destructive" 
          : `border-border hover:border-primary/50 ${zoneStyle.accent}`
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={camera.thumbnail}
          alt={camera.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Live indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="flex h-2 w-2">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              isViolation ? "bg-destructive" : "bg-success"
            )} />
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              isViolation ? "bg-destructive" : "bg-success"
            )} />
          </span>
          <span className="text-xs font-medium text-card bg-foreground/80 px-2 py-0.5 rounded">
            LIVE
          </span>
        </div>

        {/* Status badge */}
        <Badge 
          className={cn(
            "absolute top-3 right-3",
            isViolation ? "status-violation" : "status-safe"
          )}
        >
          {isViolation ? (
            <>
              <AlertTriangle className="h-3 w-3 mr-1" />
              Violation
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Safe
            </>
          )}
        </Badge>

        {/* Violation overlay */}
        {isViolation && (
          <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
            <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-semibold text-sm">
              ⚠️ PPE Violation Detected
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-card-foreground">{camera.name}</h3>
          <span className="text-xs text-muted-foreground">ID: {camera.id}</span>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span>{camera.location}</span>
        </div>

        {/* Zone badge */}
        {showZoneBadge && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn("mb-3 cursor-help", zoneStyle.badge)}
              >
                <ZoneIcon className="h-3 w-3 mr-1" />
                {zoneStyle.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {zone === 'low' && 'Minimal hazards, limited PPE required'}
                {zone === 'medium' && 'Moderate hazards, configurable PPE'}
                {zone === 'high' && 'Critical hazards, full PPE mandatory'}
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Required PPE */}
        {requiredPPE.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Required PPE:</p>
            <div className="flex flex-wrap gap-1">
              {requiredPPE.map((ppe, idx) => (
                <span 
                  key={idx}
                  className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                >
                  {ppe}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Violations list */}
        {isViolation && camera.violations.length > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs font-medium text-destructive mb-2">Missing PPE:</p>
            <div className="flex flex-wrap gap-1">
              {camera.violations.map((violation, idx) => (
                <span 
                  key={idx}
                  className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full"
                >
                  {violation}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
