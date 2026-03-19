import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { convertFileSrc } from "@tauri-apps/api/core";

interface VideoPreviewProps {
  localPath: string;
  jobId: string;
  durationSecs: number;
  fileSizeBytes: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VideoPreview({
  localPath,
  durationSecs,
  fileSizeBytes,
}: VideoPreviewProps) {
  // Convert local file path to asset URL for Tauri webview
  const videoSrc = convertFileSrc(localPath);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Generated Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <video
          src={videoSrc}
          controls
          className="w-full rounded-md bg-black"
          autoPlay
          muted
          loop
        />
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{durationSecs}s duration</span>
          <span>{formatFileSize(fileSizeBytes)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
