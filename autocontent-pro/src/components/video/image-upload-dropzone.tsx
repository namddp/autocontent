import { useState, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadDropzoneProps {
  label: string;
  value: string | null;
  onChange: (path: string | null) => void;
}

export function ImageUploadDropzone({
  label,
  value,
  onChange,
}: ImageUploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handlePickFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          { name: "Images", extensions: ["jpg", "jpeg", "png", "webp"] },
        ],
      });
      if (selected) {
        onChange(selected as string);
      }
    } catch {
      // User cancelled
    }
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  if (value) {
    const fileName = value.split(/[/\\]/).pop() || value;
    return (
      <div className="relative rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-primary">{label}</p>
            <p className="truncate text-xs text-muted-foreground">{fileName}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePickFile}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        // Tauri drag-drop handled via plugin, fallback to file picker
        handlePickFile();
      }}
      className={cn(
        "flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 text-sm transition-colors",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted"
      )}
    >
      <ImagePlus className="h-6 w-6 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground/60">
        JPEG, PNG, WebP (max 20MB)
      </span>
    </button>
  );
}
