import { useState } from 'react';
import { Camera as CameraIcon } from 'lucide-react';
import { CameraCard } from '@/components/dashboard/CameraCard';
import { ViolationModal } from '@/components/dashboard/ViolationModal';
import { ZoneTabs } from '@/components/zones/ZoneTabs';
import { ZoneConfigPanel } from '@/components/zones/ZoneConfigPanel';
import { useZone } from '@/contexts/ZoneContext';
import { cameras, Camera, RiskZone } from '@/data/mockData';

const LiveCameras = () => {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeZone, setActiveZone] = useState<RiskZone>('low');
  const { getRequiredPPE } = useZone();

  const handleCameraClick = (camera: Camera) => {
    setSelectedCamera(camera);
    setModalOpen(true);
  };

  // Filter cameras by zone
  const filteredCameras = cameras.filter((cam) => cam.zone === activeZone);

  // Count violations per zone
  const violationCounts: Record<RiskZone, number> = {
    low: cameras.filter((c) => c.zone === 'low' && c.status === 'violation').length,
    medium: cameras.filter((c) => c.zone === 'medium' && c.status === 'violation').length,
    high: cameras.filter((c) => c.zone === 'high' && c.status === 'violation').length,
  };

  // Get required PPE for active zone
  const requiredPPE = getRequiredPPE(activeZone);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CameraIcon className="h-6 w-6 text-primary" />
            Live Cameras
          </h1>
          <p className="text-muted-foreground">
            Monitor CCTV feeds by risk zone
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span>{cameras.length} cameras online</span>
        </div>
      </div>

      {/* Zone Tabs */}
      <ZoneTabs
        activeZone={activeZone}
        onZoneChange={setActiveZone}
        violationCounts={violationCounts}
      />

      {/* Zone Configuration Panel */}
      <ZoneConfigPanel activeZone={activeZone} />

      {/* Filtered Camera Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {activeZone === 'low' && 'Low Risk Zone Cameras'}
            {activeZone === 'medium' && 'Medium Risk Zone Cameras'}
            {activeZone === 'high' && 'High Risk Zone Cameras'}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredCameras.length} camera(s)
          </span>
        </div>

        {filteredCameras.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCameras.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onClick={() => handleCameraClick(camera)}
                requiredPPE={requiredPPE}
                showZoneBadge={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CameraIcon className="h-12 w-12 mb-4 opacity-50" />
            <p>No cameras assigned to this zone</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <ViolationModal
        camera={selectedCamera}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default LiveCameras;
