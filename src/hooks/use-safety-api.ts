import { useDetection } from '@/contexts/DetectionContext';
import { DetectionAnalytics, DetectionViolation } from '@/lib/api';

export function useSafetyApi() {
  const { result, refreshResult, isRefreshing } = useDetection();
  return {
    result,
    refreshResult,
    isRefreshing,
    alerts: result?.violations ?? [],
    analytics: result?.analytics ?? null,
  };
}

export function useAlerts(): DetectionViolation[] {
  const { result } = useDetection();
  return result?.violations ?? [];
}

export function useAnalytics(): DetectionAnalytics | null {
  const { result } = useDetection();
  return result?.analytics ?? null;
}

export function useLatestResult() {
  return useDetection();
}