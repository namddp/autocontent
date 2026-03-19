import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface GenerationProgress {
  job_id: string;
  status: string;
  message: string;
}

interface VideoResult {
  job_id: string;
  local_path: string;
  requested_duration_secs: number;
  file_size_bytes: number;
}

export function useVeo3Generation() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unlisten = listen<GenerationProgress>("veo3:progress", (event) => {
      setProgress(event.payload);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const generate = async (
    prompt: string,
    config: { quality: string; duration: number; mode: string },
    apiKey: string,
  ) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const videoResult = await invoke<VideoResult>("veo3_generate_video", {
        prompt,
        quality: config.quality,
        duration: config.duration,
        mode: config.mode,
        apiKey,
      });
      setResult(videoResult);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  return { generate, isGenerating, progress, result, error };
}
