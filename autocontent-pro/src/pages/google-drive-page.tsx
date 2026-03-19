import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { PageContainer } from "@/components/shared/page-container";
import { DriveFileList } from "@/components/drive/drive-file-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, RefreshCw, HardDrive } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  webViewLink?: string;
  createdTime?: string;
}

interface UploadProgress {
  fileName: string;
  bytesSent: number;
  totalBytes: number;
  percent: number;
}

export function GoogleDrivePage() {
  const [accessToken, setAccessToken] = useState("");
  const [folderName, setFolderName] = useState("AutoContent");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [uploadProgress, setUploadProgress] =
    useState<UploadProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unlisten = listen<UploadProgress>(
      "drive:upload_progress",
      (event) => {
        setUploadProgress(event.payload);
      },
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const loadFiles = async () => {
    if (!accessToken.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await invoke<DriveFile[]>("drive_list_files", {
        accessToken,
        folderName,
      });
      setFiles(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!accessToken.trim()) return;
    setIsUploading(true);
    setError(null);
    try {
      // Use Tauri dialog to pick file
      const { open } = await import("@tauri-apps/plugin-dialog");
      const filePath = await open({
        multiple: false,
        filters: [
          { name: "Video", extensions: ["mp4", "webm", "avi", "mkv"] },
          { name: "Subtitle", extensions: ["srt", "vtt"] },
          { name: "All", extensions: ["*"] },
        ],
      });
      if (!filePath) {
        setIsUploading(false);
        return;
      }

      await invoke<DriveFile>("drive_upload", {
        accessToken,
        filePath: filePath as string,
        folderName,
      });

      setUploadProgress(null);
      await loadFiles();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    setError(null);
    try {
      await invoke("drive_delete_file", { accessToken, fileId });
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      setError(String(err));
    }
  };

  if (!accessToken.trim()) {
    return (
      <PageContainer
        title="Google Drive"
        description="Upload and manage files on Google Drive"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connect to Google Drive</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="drive-token">Access Token</Label>
              <input
                id="drive-token"
                type="password"
                placeholder="Paste your Google OAuth access token..."
                value={accessToken}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAccessToken(e.target.value)
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Use OAuth2 flow from Accounts page or paste a token directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Google Drive"
      description="Upload and manage files on Google Drive"
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label>Folder</Label>
            <input
              value={folderName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFolderName(e.target.value)
              }
              placeholder="AutoContent"
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Button onClick={loadFiles} variant="outline" disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>

        {/* Upload progress */}
        {uploadProgress && isUploading && (
          <Card>
            <CardContent className="space-y-2 py-4">
              <p className="text-sm font-medium">
                {uploadProgress.fileName}
              </p>
              <Progress value={uploadProgress.percent} />
              <p className="text-xs text-muted-foreground">
                {(uploadProgress.bytesSent / 1024 / 1024).toFixed(1)} /{" "}
                {(uploadProgress.totalBytes / 1024 / 1024).toFixed(1)} MB
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* File list */}
        {files.length > 0 ? (
          <DriveFileList files={files} onDelete={handleDelete} />
        ) : (
          !isLoading && (
            <EmptyState
              icon={HardDrive}
              title="No files yet"
              description="Upload files or click Refresh to load existing files"
            />
          )
        )}
      </div>
    </PageContainer>
  );
}
