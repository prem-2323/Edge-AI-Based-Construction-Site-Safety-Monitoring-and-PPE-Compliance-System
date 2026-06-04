import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DetectionResponse, getLatestResult } from '@/lib/api';

interface DetectionContextValue {
  result: DetectionResponse | null;
  isRefreshing: boolean;
  refreshResult: () => Promise<void>;
  setResult: React.Dispatch<React.SetStateAction<DetectionResponse | null>>;
}

const DetectionContext = createContext<DetectionContextValue | undefined>(undefined);
const POLL_MS = 3000;

export const DetectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshResult = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const latest = await getLatestResult();
      setResult(latest);
    } catch {
      // Preserve the last known result if the backend is unavailable.
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshResult();
    const timer = window.setInterval(refreshResult, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refreshResult]);

  const value = useMemo(
    () => ({ result, isRefreshing, refreshResult, setResult }),
    [result, isRefreshing, refreshResult],
  );

  return <DetectionContext.Provider value={value}>{children}</DetectionContext.Provider>;
};

export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
};