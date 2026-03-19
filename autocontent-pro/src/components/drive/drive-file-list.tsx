import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ExternalLink,
  FileVideo,
  FileText,
  Folder,
  Trash2,
} from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  webViewLink?: string;
  createdTime?: string;
}

interface DriveFileListProps {
  files: DriveFile[];
  onDelete: (fileId: string) => void;
  isDeleting?: boolean;
}

export function DriveFileList({
  files,
  onDelete,
  isDeleting,
}: DriveFileListProps) {
  if (files.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No files in this folder
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <Card key={file.id}>
          <CardContent className="flex items-center gap-3 py-3">
            <FileIcon mimeType={file.mimeType} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {file.size ? formatFileSize(file.size) : "—"}
                {file.createdTime &&
                  ` · ${new Date(file.createdTime).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex gap-1">
              {file.webViewLink && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    window.open(file.webViewLink, "_blank")
                  }
                  title="Open in Drive"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(file.id)}
                disabled={isDeleting}
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("video/")) {
    return <FileVideo className="h-5 w-5 shrink-0 text-blue-500" />;
  }
  if (mimeType === "application/vnd.google-apps.folder") {
    return <Folder className="h-5 w-5 shrink-0 text-yellow-500" />;
  }
  return <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
