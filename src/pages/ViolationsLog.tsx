import { FileWarning, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAlerts } from '@/hooks/use-safety-api';
import { mapApiAlertToAlert } from '@/lib/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ViolationsLog = () => {
  const apiAlerts = useAlerts();
  const logs = apiAlerts.map((a, i) => ({ ...mapApiAlertToAlert(a, i), status: 'unresolved' as const }));

  const unresolved = logs.length;
  const resolved = 0;
  const total = logs.length;

  const severityColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-warning/10 text-warning',
    high: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileWarning className="h-6 w-6 text-primary" />
          Violations Log
        </h1>
        <p className="text-muted-foreground">
          Complete history of detected PPE violations (Unsafe Events)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{unresolved}</p>
              <p className="text-sm text-muted-foreground">Unresolved</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{resolved}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{total}</p>
              <p className="text-sm text-muted-foreground">Total (from video)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Time</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Violation Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No violations yet. Upload a video to process.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, i) => (
                <TableRow key={`${log.cameraId}-${log.timestamp.toISOString()}-${i}`} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm">
                    {format(log.timestamp, 'HH:mm:ss')}
                    <span className="block text-xs text-muted-foreground">
                      {format(log.timestamp, 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{log.cameraName}</span>
                    <span className="block text-xs text-muted-foreground">ID: {log.cameraId}</span>
                  </TableCell>
                  <TableCell>{log.violationType}</TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize', severityColors[log.severity])}>
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-destructive/10 text-destructive">
                      <XCircle className="h-3 w-3 mr-1" /> Unresolved
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ViolationsLog;
