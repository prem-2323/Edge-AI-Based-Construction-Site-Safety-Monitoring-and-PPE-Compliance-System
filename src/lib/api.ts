import axios from 'axios';

const API_BASE = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE,
});

export interface DetectionViolation {
  time: string;
  worker_id: number;
  missing_ppe: string[];
  severity: 'low' | 'medium' | 'high';
  status: string;
}

export interface DetectionAnalytics {
  total_workers: number;
  safe_count: number;
  unsafe_count: number;
  alerts_count: number;
  helmet_missing_count: number;
  vest_missing_count: number;
  shoes_missing_count: number;
  gloves_missing_count: number;
  violation_rate: number;
  weekly_trend: Array<{ day: string; violations: number }>;
  pie_distribution: Array<{ name: string; count: number }>;
  frames_processed: number;
  video_fps: number;
}

export interface DetectionResponse {
  workers: number;
  safe: number;
  unsafe: number;
  alerts: number;
  violations: DetectionViolation[];
  analytics: DetectionAnalytics;
  annotated_video: string;
}

export async function uploadVideo(
  file: File,
  onUploadProgress?: (progress: { loaded: number; total: number; percent: number }) => void,
): Promise<DetectionResponse> {
  const form = new FormData();
  form.append('file', file);

  const response = await apiClient.post<DetectionResponse>('/upload-video', form, {
    onUploadProgress: (event) => {
      const total = event.total ?? 0;
      const percent = total ? Math.round((event.loaded / total) * 100) : 0;
      onUploadProgress?.({ loaded: event.loaded, total, percent });
    },
  });

  return response.data;
}

export async function getLatestResult(): Promise<DetectionResponse> {
  const response = await apiClient.get<DetectionResponse>('/api/latest-result');
  return response.data;
}

export function resolveMediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
}

export function getAnnotatedVideoUrl(path?: string | null): string {
  return resolveMediaUrl(path ?? undefined);
}

export function getApiBaseUrl(): string {
  return API_BASE;
}