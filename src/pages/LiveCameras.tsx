import { useSafetyApi } from '@/hooks/use-safety-api';
import { Camera as CameraIcon } from 'lucide-react';

const LiveCameras = () => {
  const { result } = useSafetyApi();

  const annotatedVideo = result?.annotated_video ?? '';
  const analytics = result?.analytics ?? null;
  const violations = result?.violations ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CameraIcon className="h-6 w-6 text-primary" />
            Live Cameras
          </h1>
          <p className="text-muted-foreground">Processed camera feed and worker statuses</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span>{analytics?.total_workers ?? 0} workers tracked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          {annotatedVideo ? (
            <video src={annotatedVideo} controls className="w-full h-full bg-black" />
          ) : (
            <div className="flex h-96 items-center justify-center text-muted-foreground">
              Processed video appears here after uploading and processing a CCTV clip.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-sm font-medium text-muted-foreground">Summary</h3>
            <div className="mt-2 text-2xl font-bold">{analytics?.total_workers ?? 0}</div>
            <div className="text-sm text-muted-foreground">Workers tracked</div>
            <div className="mt-4 text-sm">
              <div>Safe: {analytics?.safe_count ?? 0}</div>
              <div>Unsafe: {analytics?.unsafe_count ?? 0}</div>
              <div>Alerts: {analytics?.alerts_count ?? 0}</div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border overflow-auto max-h-96">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Violations</h4>
            {violations.length === 0 ? (
              <div className="text-sm text-muted-foreground">No violations detected</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {violations.map((v, i) => (
                  <li key={`v-${i}`} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Worker {v.worker_id}</div>
                      <div className="text-xs text-muted-foreground">{v.time} — {v.missing_ppe.join(', ')}</div>
                    </div>
                    <div className="text-xs">
                      <span className={`px-2 py-1 rounded text-white ${v.severity === 'high' ? 'bg-destructive' : v.severity === 'medium' ? 'bg-warning' : 'bg-muted'}`}>
                        {v.severity}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCameras;
