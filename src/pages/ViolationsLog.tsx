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
import { cn } from '@/lib/utils';

const ViolationsLog = () => {
  const apiAlerts = useAlerts();
  // `apiAlerts` is an array of detection violations returned by the backend
  const logs = apiAlerts.map((a, i) => ({
    // backend fields: time (string), worker_id, missing_ppe, severity, status
    time: a.time,
    workerId: a.worker_id,
    violationType: a.missing_ppe.join(', '),
    severity: a.severity,
    status: a.status,
    idx: i,
  }));

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
                logs.map((log) => (
                  <TableRow key={`violation-${log.workerId}-${log.idx}`} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">
                      {log.time}
                      <span className="block text-xs text-muted-foreground">from video</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">Worker</span>
                      <span className="block text-xs text-muted-foreground">ID: {log.workerId}</span>
                    </TableCell>
                    <TableCell>{log.violationType}</TableCell>
                    <TableCell>
                      <Badge className={cn('capitalize', severityColors[log.severity] || 'bg-muted text-muted-foreground')}>
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={log.status === 'UNSAFE' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}>
                        {log.status}
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
