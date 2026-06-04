import { Users, AlertTriangle, ShieldCheck, Bell, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { UploadVideo } from '@/components/dashboard/UploadVideo';
import { useSafetyApi } from '@/hooks/use-safety-api';
import { getAnnotatedVideoUrl } from '@/lib/api';

const Dashboard = () => {
  const { alerts: apiAlerts, analytics, result } = useSafetyApi();

  const totalWorkers = analytics?.total_workers ?? 0;
  const unsafeCount = analytics?.unsafe_count ?? 0;
  const safeCount = analytics?.safe_count ?? 0;
  const alertsCount = analytics?.alerts_count ?? 0;
  const annotatedVideo = result ? getAnnotatedVideoUrl(result.annotated_video) : '';

  return (
    <div className="space-y-6">
      {/* Header + Upload */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Real-time PPE safety monitoring overview</p>
        </div>
        <UploadVideo />
      </div>

      {/* Summary Cards — Worker Count & Analytics from API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Workers"
          value={totalWorkers}
          icon={Users}
          subtitle="Unique tracked"
        />
        <SummaryCard
          title="Unsafe"
          value={unsafeCount}
          icon={AlertTriangle}
          variant={unsafeCount > 0 ? 'danger' : 'default'}
          subtitle="Requires attention"
        />
        <SummaryCard
          title="Safe"
          value={safeCount}
          icon={ShieldCheck}
          variant="success"
          subtitle="Compliant"
        />
        <SummaryCard
          title="Alerts"
          value={alertsCount}
          icon={Bell}
          variant={alertsCount > 0 ? 'danger' : 'default'}
          subtitle="Violation events"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Processed Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.frames_processed ? (
              <video
                key={analytics.frames_processed}
                src={annotatedVideo}
                controls
                className="w-full rounded-lg border border-border bg-black"
              />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
                Upload a video to process PPE detections.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <AlertPanel alerts={apiAlerts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
