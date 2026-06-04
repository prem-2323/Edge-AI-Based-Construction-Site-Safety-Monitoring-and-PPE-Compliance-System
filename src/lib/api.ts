/** Backend API client. Base URL: VITE_API_URL or http://localhost:8000 */

const API_BASE = (import.meta.env?.VITE_API_URL as string) || "http://localhost:8000";

export interface ApiAlert {
  worker_id: number;
  status: string;
  missing: string[];
  timestamp: string;
}

export interface ApiAnalytics {
  total_workers: number;
  safe_count: number;
  unsafe_count: number;
  alerts_count: number;
  violation_rate: number;
}

export interface ApiJobStatus {
  running: boolean;
  status: 'idle' | 'queued' | 'processing' | 'ready' | 'failed' | string;
  input_name: string | null;
  output_ready: boolean;
  output_url: string | null;
  error: string | null;
  has_model: boolean;
}

export async function uploadVideo(file: File): Promise<{ status: string }> {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch(`${API_BASE}/api/upload-video`, { method: "POST", body: form });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `Upload failed: ${r.status}`);
  }
  return r.json();
}

export async function getAlerts(): Promise<ApiAlert[]> {
  const r = await fetch(`${API_BASE}/api/alerts`);
  if (!r.ok) return [];
  return r.json();
}

export async function getAnalytics(): Promise<ApiAnalytics | null> {
  const r = await fetch(`${API_BASE}/api/analytics`);
  if (!r.ok) return null;
  return r.json();
}

export async function getJobStatus(): Promise<ApiJobStatus | null> {
  const r = await fetch(`${API_BASE}/api/status`);
  if (!r.ok) return null;
  return r.json();
}

export function getOutputVideoUrl(): string {
  return `${API_BASE}/api/output-video`;
}

/** Map backend alert to dashboard Alert for AlertPanel. */
export function mapApiAlertToAlert(a: ApiAlert, index: number): {
  id: number;
  cameraId: number;
  cameraName: string;
  violationType: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
} {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const violationType = a.missing.length
    ? a.missing.map((m) => cap(m) + ' Missing').join(', ')
    : 'PPE violation';
  const severity: 'low' | 'medium' | 'high' = a.missing.some((m) => /helmet|hat/i.test(m))
    ? 'high'
    : 'medium';
  return {
    id: a.worker_id * 1000 + index,
    cameraId: a.worker_id,
    cameraName: `Worker ${a.worker_id}`,
    violationType,
    timestamp: new Date(a.timestamp),
    severity,
  };
}
