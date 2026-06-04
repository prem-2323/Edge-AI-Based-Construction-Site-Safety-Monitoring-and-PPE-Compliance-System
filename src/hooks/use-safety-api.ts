import { useState, useEffect, useCallback } from 'react';
import { getAlerts, getAnalytics, getJobStatus, type ApiAlert, type ApiAnalytics, type ApiJobStatus } from '@/lib/api';

const POLL_MS = 1500;

export function useSafetyApi() {
  const [alerts, setAlerts] = useState<ApiAlert[]>([]);
  const [analytics, setAnalytics] = useState<ApiAnalytics | null>(null);

  const fetchData = useCallback(async () => {
    const [a, an] = await Promise.all([getAlerts(), getAnalytics()]);
    setAlerts(a);
    setAnalytics(an);
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, POLL_MS);
    return () => clearInterval(t);
  }, [fetchData]);

  return { alerts, analytics };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<ApiAlert[]>([]);

  useEffect(() => {
    const f = async () => {
      const a = await getAlerts();
      setAlerts(a);
    };
    f();
    const t = setInterval(f, POLL_MS);
    return () => clearInterval(t);
  }, []);

  return alerts;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<ApiAnalytics | null>(null);

  useEffect(() => {
    const f = async () => {
      const a = await getAnalytics();
      setAnalytics(a);
    };
    f();
    const t = setInterval(f, POLL_MS);
    return () => clearInterval(t);
  }, []);

  return analytics;
}

export function useJobStatus() {
  const [status, setStatus] = useState<ApiJobStatus | null>(null);

  useEffect(() => {
    const f = async () => {
      const s = await getJobStatus();
      setStatus(s);
    };
    f();
    const t = setInterval(f, POLL_MS);
    return () => clearInterval(t);
  }, []);

  return status;
}
