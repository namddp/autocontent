import { cn } from "@/lib/utils";
import { Type, ImageIcon, Copy } from "lucide-react";

export type GenerationMode = "text_to_video" | "image_to_video" | "clone_video";

interface GenerationModeSelectorProps {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

const MODES = [
  {
    value: "text_to_video" as const,
    label: "Text to Video",
    icon: Type,
    description: "Tạo video từ prompt text",
  },
  {
    value: "image_to_video" as const,
    label: "Image to Video",
    icon: ImageIcon,
    description: "Ảnh + prompt → video",
  },
  {
    value: "clone_video" as const,
    label: "Clone Video",
    icon: Copy,
    description: "Frame đầu + cuối → video",
  },
];

export function GenerationModeSelector({
  value,
  onChange,
}: GenerationModeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = value === mode.value;
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors",
              isActive
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{mode.label}</span>
            <span className="text-[10px] leading-tight opacity-70">
              {mode.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
