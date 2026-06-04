import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { DetectionViolation } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AlertPanelProps {
  alerts: DetectionViolation[];
}

export const AlertPanel = ({ alerts }: AlertPanelProps) => {
  const severityColors = {
    low: 'border-l-warning',
    medium: 'border-l-warning',
    high: 'border-l-destructive',
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      <div className="px-4 py-3 bg-destructive/10 border-b border-border flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="font-semibold text-card-foreground">Active Alerts</h3>
        <span className="ml-auto text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
          {alerts.length} new
        </span>
      </div>

      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No active alerts</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-4",
                severityColors[alert.severity]
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-card-foreground">
                      Worker {alert.worker_id}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full uppercase font-medium",
                      alert.severity === 'high' 
                        ? "bg-destructive/10 text-destructive" 
                        : "bg-warning/10 text-warning"
                    )}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Missing PPE: {alert.missing_ppe.join(', ')}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{alert.time}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
