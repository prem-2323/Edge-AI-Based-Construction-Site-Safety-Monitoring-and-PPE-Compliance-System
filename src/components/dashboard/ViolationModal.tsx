import { X, MapPin, AlertTriangle, Clock, HardHat, Shirt } from 'lucide-react';
import { Camera } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ViolationModalProps {
  camera: Camera | null;
  open: boolean;
  onClose: () => void;
}

const violationIcons: Record<string, typeof HardHat> = {
  'Helmet Missing': HardHat,
  'Safety Vest Missing': Shirt,
};

export const ViolationModal = ({ camera, open, onClose }: ViolationModalProps) => {
  if (!camera) return null;

  const isViolation = camera.status === 'violation';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {camera.name}
            <Badge className={isViolation ? "status-violation" : "status-safe"}>
              {isViolation ? 'Violation' : 'Safe'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera feed */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={camera.thumbnail}
              alt={camera.name}
              className="w-full h-full object-cover"
            />
            {isViolation && (
              <div className="absolute inset-0 bg-destructive/30 flex items-center justify-center">
                <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-semibold">
                  ⚠️ PPE Violation Active
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{camera.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last checked: Just now</span>
            </div>
          </div>

          {/* Violations */}
          {isViolation && camera.violations.length > 0 && (
            <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/30">
              <h4 className="font-semibold text-destructive flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4" />
                Detected Violations
              </h4>
              <ul className="space-y-2">
                {camera.violations.map((violation, idx) => {
                  const Icon = violationIcons[violation] || AlertTriangle;
                  return (
                    <li key={idx} className="flex items-center gap-2 text-sm text-card-foreground">
                      <Icon className="h-4 w-4 text-destructive" />
                      <span>{violation}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" variant="default">
              Acknowledge
            </Button>
            <Button className="flex-1" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
