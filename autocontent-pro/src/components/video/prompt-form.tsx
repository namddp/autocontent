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

interface PromptFormProps {
  onGenerate: (
    prompt: string,
    config: { quality: string; duration: number; mode: string },
  ) => void;
  isGenerating: boolean;
}

export function PromptForm({ onGenerate, isGenerating }: PromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [quality, setQuality] = useState("standard");
  const [duration, setDuration] = useState("8");
  const [mode, setMode] = useState("standard");

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt, {
      quality,
      duration: parseInt(duration),
      mode,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Prompt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="prompt">Describe your video</Label>
          <Textarea
            id="prompt"
            placeholder="A cinematic shot of ocean waves at sunset..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
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
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Video"}
        </Button>
      </CardContent>
    </Card>
  );
}
