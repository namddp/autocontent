import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Captions, Download, Loader2 } from "lucide-react";

interface SubtitleSegment {
  index: number;
  start_ms: number;
  end_ms: number;
  text: string;
}

interface SubtitlePanelProps {
  videoPath: string;
}

export function SubtitlePanel({ videoPath }: SubtitlePanelProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [model, setModel] = useState("tiny");
  const [language, setLanguage] = useState("auto");
  const [error, setError] = useState<string | null>(null);

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    setError(null);
    try {
      const result = await invoke<{
        segments: SubtitleSegment[];
        language: string;
        duration_ms: number;
      }>("transcribe_video", {
        videoPath,
        model,
        language: language === "auto" ? null : language,
      });
      setSegments(result.segments);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSaveSrt = async () => {
    try {
      const outputPath = videoPath.replace(/\.[^.]+$/, ".srt");
      await invoke("save_srt", { segments, outputPath });
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Captions className="h-5 w-5" />
          Subtitle Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Model</Label>
            <Select
              value={model}
              onValueChange={(v) => v && setModel(v)}
              disabled={isTranscribing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiny">Tiny (fast)</SelectItem>
                <SelectItem value="base">Base (balanced)</SelectItem>
                <SelectItem value="small">Small (accurate)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Language</Label>
            <Select
              value={language}
              onValueChange={(v) => v && setLanguage(v)}
              disabled={isTranscribing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Vietnamese</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={handleTranscribe}
          disabled={isTranscribing || !videoPath}
          className="w-full"
        >
          {isTranscribing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
              Transcribing...
            </>
          ) : (
            <>
              <Captions className="mr-2 h-4 w-4" /> Generate Subtitles
            </>
          )}
        </Button>

        {segments.length > 0 && (
          <>
            <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-3">
              {segments.map((seg) => (
                <div key={seg.index} className="flex gap-3 text-sm">
                  <span className="whitespace-nowrap font-mono text-muted-foreground">
                    {formatTime(seg.start_ms)}
                  </span>
                  <span>{seg.text}</span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={handleSaveSrt}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" /> Save SRT File
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
