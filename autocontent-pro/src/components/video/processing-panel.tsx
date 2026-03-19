import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Play, Square } from "lucide-react";

interface ProcessingProgress {
  job_id: string;
  stage: string;
  current_frame: number;
  total_frames: number;
  percent: number;
  message: string;
}

interface ProcessingPanelProps {
  videoPath: string;
  jobId: string;
}

export function ProcessingPanel({ videoPath, jobId }: ProcessingPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [scale, setScale] = useState("4");
  const [quality, setQuality] = useState("medium");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unlisten = listen<ProcessingProgress>(
      "video:progress",
      (event) => {
        if (event.payload.job_id !== jobId) return;
        setProgress(event.payload);
        if (event.payload.stage === "completed") {
          setIsProcessing(false);
        }
      },
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const startProcessing = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const outputPath = videoPath.replace(
        /\.mp4$/i,
        `_${scale}x_upscaled.mp4`,
      );
      await invoke("process_video", {
        inputPath: videoPath,
        outputPath,
        scaleFactor: parseInt(scale),
        quality,
        jobId,
      });
    } catch (err) {
      setError(String(err));
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Video Processing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Upscale Factor</Label>
            <Select
              value={scale}
              onValueChange={(v) => v && setScale(v)}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="4">4x</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Output Quality</Label>
            <Select
              value={quality}
              onValueChange={(v) => v && setQuality(v)}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High (slow)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="capitalize">{progress.stage}</span>
              <span>{progress.percent.toFixed(1)}%</span>
            </div>
            <Progress value={progress.percent} />
            <p className="text-xs text-muted-foreground">
              {progress.message}
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          onClick={startProcessing}
          disabled={isProcessing || !videoPath}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Square className="mr-2 h-4 w-4" /> Processing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Start Processing
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
