import { useRef, useState } from 'react';
import { Upload, Loader2, CheckCircle, Video, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadVideo, getAnnotatedVideoUrl } from '@/lib/api';
import { useDetection } from '@/contexts/DetectionContext';
import { cn } from '@/lib/utils';

export const UploadVideo = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { result, setResult } = useDetection();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setDone(false);
    setUploading(true);
    setUploadProgress(0);
    try {
      const detection = await uploadVideo(f, (progress) => setUploadProgress(progress.percent));
      setResult(detection);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const annotatedVideoUrl = result ? getAnnotatedVideoUrl(result.annotated_video) : '';

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Video className="h-4 w-4" />
          Upload CCTV Video
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Status:</span>{' '}
          {uploading ? `Uploading video... ${uploadProgress}%` : result?.alerts ? 'Processing complete' : 'Idle'}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,.avi,.mov,.mkv,.webm"
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Processing…'}
            </>
          ) : done ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2 text-success" />
              Processing started
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Choose video
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          .mp4, .avi, .mov, .mkv, .webm — processing runs in the background.
        </p>
        <a
          href={annotatedVideoUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'text-xs inline-flex items-center gap-1',
            annotatedVideoUrl ? 'text-primary hover:underline' : 'text-muted-foreground pointer-events-none'
          )}
        >
          <Film className="h-3 w-3" />
          {annotatedVideoUrl ? 'View annotated video' : 'Annotated video appears after processing'}
        </a>
        {error && (
          <p className={cn("text-xs text-destructive")}>{error}</p>
        )}
      </CardContent>
    </Card>
  );
};
