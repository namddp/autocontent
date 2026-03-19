import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import {
  GenerationModeSelector,
  type GenerationMode,
} from "./generation-mode-selector";
import { ImageUploadDropzone } from "./image-upload-dropzone";

interface PromptFormProps {
  onGenerate: (
    prompt: string,
    config: {
      quality: string;
      duration: number;
      mode: string;
      generationType: string;
      imagePath: string | null;
      imagePathEnd: string | null;
    }
  ) => void;
  isGenerating: boolean;
}

export function PromptForm({ onGenerate, isGenerating }: PromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [quality, setQuality] = useState("standard");
  const [duration, setDuration] = useState("8");
  const [mode, setMode] = useState("standard");
  const [generationType, setGenerationType] =
    useState<GenerationMode>("text_to_video");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imagePathEnd, setImagePathEnd] = useState<string | null>(null);

  const canGenerate =
    generationType === "text_to_video"
      ? prompt.trim().length > 0
      : generationType === "image_to_video"
        ? imagePath && prompt.trim().length > 0
        : generationType === "clone_video"
          ? imagePath && imagePathEnd
          : false;

  const handleSubmit = () => {
    if (!canGenerate) return;
    onGenerate(prompt, {
      quality,
      duration: parseInt(duration),
      mode,
      generationType,
      imagePath,
      imagePathEnd,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Generation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <GenerationModeSelector
          value={generationType}
          onChange={(m) => {
            setGenerationType(m);
            setImagePath(null);
            setImagePathEnd(null);
          }}
        />

        {generationType === "image_to_video" && (
          <ImageUploadDropzone
            label="Chọn ảnh nguồn"
            value={imagePath}
            onChange={setImagePath}
          />
        )}

        {generationType === "clone_video" && (
          <div className="grid grid-cols-2 gap-3">
            <ImageUploadDropzone
              label="Frame đầu tiên"
              value={imagePath}
              onChange={setImagePath}
            />
            <ImageUploadDropzone
              label="Frame cuối cùng"
              value={imagePathEnd}
              onChange={setImagePathEnd}
            />
          </div>
        )}

        <div>
          <Label htmlFor="prompt">
            {generationType === "clone_video"
              ? "Mô tả chuyển động (tuỳ chọn)"
              : "Mô tả video"}
          </Label>
          <Textarea
            id="prompt"
            placeholder={
              generationType === "clone_video"
                ? "Smooth camera pan with cinematic lighting..."
                : "A cinematic shot of ocean waves at sunset..."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Quality</Label>
            <Select value={quality} onValueChange={(v) => v && setQuality(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">720p Standard</SelectItem>
                <SelectItem value="hd">1080p HD</SelectItem>
                <SelectItem value="4k">4K Ultra HD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Duration</Label>
            <Select value={duration} onValueChange={(v) => v && setDuration(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 seconds</SelectItem>
                <SelectItem value="6">6 seconds</SelectItem>
                <SelectItem value="8">8 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => v && setMode(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast ($0.15/s)</SelectItem>
                <SelectItem value="standard">Standard ($0.60/s)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isGenerating || !canGenerate}
          className="w-full"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Video"}
        </Button>
      </CardContent>
    </Card>
  );
}
