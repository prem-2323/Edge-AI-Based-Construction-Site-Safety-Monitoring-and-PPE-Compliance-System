import { useState } from 'react';
import { Users, AlertTriangle, ShieldCheck, Bell } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { CameraCard } from '@/components/dashboard/CameraCard';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { ViolationModal } from '@/components/dashboard/ViolationModal';
import { UploadVideo } from '@/components/dashboard/UploadVideo';
import { useSafetyApi } from '@/hooks/use-safety-api';
import { mapApiAlertToAlert } from '@/lib/api';
import { cameras as initialCameras, Camera as CameraType } from '@/data/mockData';

const Dashboard = () => {
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { alerts: apiAlerts, analytics } = useSafetyApi();

  const cameras = initialCameras;
  const totalWorkers = analytics?.total_workers ?? 0;
  const unsafeCount = analytics?.unsafe_count ?? 0;
  const safeCount = analytics?.safe_count ?? 0;
  const alertsCount = analytics?.alerts_count ?? 0;
  const activeAlerts = apiAlerts.map((a, i) => mapApiAlertToAlert(a, i));

  const handleCameraClick = (camera: CameraType) => {
    setSelectedCamera(camera);
    setModalOpen(true);
  };

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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Camera Grid */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Live Camera Feeds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cameras.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onClick={() => handleCameraClick(camera)}
              />
            ))}
          </div>
        </div>

        {/* Alert Panel — live from /api/alerts */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <AlertPanel alerts={activeAlerts} />
        </div>
      </div>

      <ViolationModal
        camera={selectedCamera}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
