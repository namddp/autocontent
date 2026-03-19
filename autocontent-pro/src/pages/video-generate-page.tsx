import { useState } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PromptForm } from "@/components/video/prompt-form";
import { GenerationProgress } from "@/components/video/generation-progress";
import { VideoPreview } from "@/components/video/video-preview";
import { VideoHistory } from "@/components/video/video-history";
import { ProcessingPanel } from "@/components/video/processing-panel";
import { SubtitlePanel } from "@/components/video/subtitle-panel";
import { useVeo3Generation } from "@/hooks/use-veo3-generation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export function VideoGeneratePage() {
  const { generate, isGenerating, progress, result, error } =
    useVeo3Generation();
  const [apiKey, setApiKey] = useState("");

  const handleGenerate = (
    prompt: string,
    config: { quality: string; duration: number; mode: string },
  ) => {
    if (!apiKey.trim()) return;
    generate(prompt, config, apiKey);
  };

  return (
    <PageContainer
      title="Video Generate"
      description="Create AI videos with VEO3 via Gemini API"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: prompt + config */}
        <div className="space-y-4 lg:col-span-2">
          {/* API Key input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="api-key">Gemini API Key</Label>
              <input
                id="api-key"
                type="password"
                placeholder="Enter your Gemini API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Get your key from Google AI Studio. Stored locally only.
              </p>
            </CardContent>
          </Card>

          <PromptForm onGenerate={handleGenerate} isGenerating={isGenerating} />

          {/* Progress indicator */}
          {progress && (
            <GenerationProgress
              status={progress.status}
              message={progress.message}
            />
          )}

          {/* Error display */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Video preview + processing */}
          {result && (
            <>
              <VideoPreview
                localPath={result.local_path}
                jobId={result.job_id}
                durationSecs={result.requested_duration_secs}
                fileSizeBytes={result.file_size_bytes}
              />
              <ProcessingPanel
                videoPath={result.local_path}
                jobId={result.job_id}
              />
              <SubtitlePanel videoPath={result.local_path} />
            </>
          )}
        </div>

        {/* Right column: history */}
        <div>
          <VideoHistory />
        </div>
      </div>
    </PageContainer>
  );
}
