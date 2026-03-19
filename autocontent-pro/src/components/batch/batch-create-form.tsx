import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layers, Play } from "lucide-react";

interface BatchCreateFormProps {
  onBatchCreated: (batchId: string) => void;
}

export function BatchCreateForm({ onBatchCreated }: BatchCreateFormProps) {
  const [prompts, setPrompts] = useState("");
  const [enableUpscale, setEnableUpscale] = useState(true);
  const [enableSubtitle, setEnableSubtitle] = useState(false);
  const [enableUpload, setEnableUpload] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const promptCount = prompts
    .split("\n")
    .filter((p) => p.trim()).length;

  const handleCreate = async () => {
    const promptList = prompts
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (promptList.length === 0) return;

    setIsCreating(true);
    setError(null);
    try {
      const batchId = await invoke<string>("batch_create", {
        config: {
          prompts: promptList,
          accountIds: [],
          pipeline: {
            generate: true,
            upscale: enableUpscale,
            upscaleFactor: 4,
            subtitle: enableSubtitle,
            upload: enableUpload,
            driveFolder: "AutoContent",
          },
          priority: "normal",
          veo3Config: {
            quality: "standard",
            duration: 8,
            mode: "standard",
          },
        },
      });

      await invoke("batch_start");
      onBatchCreated(batchId);
      setPrompts("");
    } catch (err) {
      setError(String(err));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-5 w-5" />
          Create Batch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Prompts (one per line)</Label>
          <Textarea
            value={prompts}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setPrompts(e.target.value)
            }
            rows={6}
            placeholder={"A cinematic sunset over the ocean\nA cat playing with yarn\nAerial view of mountains"}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {promptCount} prompt{promptCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enableUpscale}
              onChange={(e) => setEnableUpscale(e.target.checked)}
              className="rounded"
            />
            Upscale (4x RealESRGAN)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enableSubtitle}
              onChange={(e) => setEnableSubtitle(e.target.checked)}
              className="rounded"
            />
            Generate Subtitles
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enableUpload}
              onChange={(e) => setEnableUpload(e.target.checked)}
              className="rounded"
            />
            Upload to Google Drive
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={handleCreate}
          disabled={isCreating || promptCount === 0}
          className="w-full"
        >
          <Play className="mr-2 h-4 w-4" />
          {isCreating
            ? "Creating..."
            : `Start Batch (${promptCount} video${promptCount !== 1 ? "s" : ""})`}
        </Button>
      </CardContent>
    </Card>
  );
}
