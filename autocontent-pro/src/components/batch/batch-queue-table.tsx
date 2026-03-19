import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, X } from "lucide-react";

interface BatchJob {
  id: string;
  batchId: string;
  prompt: string;
  status: string;
  currentStage: string | null;
  error: string | null;
  retryCount: number;
}

interface BatchQueueTableProps {
  jobs: BatchJob[];
  onCancel: (jobId: string) => void;
  onRetry: (jobId: string) => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  generating: "bg-blue-500/20 text-blue-500",
  upscaling: "bg-purple-500/20 text-purple-500",
  subtitling: "bg-yellow-500/20 text-yellow-500",
  uploading: "bg-cyan-500/20 text-cyan-500",
  completed: "bg-green-500/20 text-green-500",
  failed: "bg-destructive/20 text-destructive",
  cancelled: "bg-muted text-muted-foreground line-through",
};

export function BatchQueueTable({
  jobs,
  onCancel,
  onRetry,
}: BatchQueueTableProps) {
  if (jobs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No jobs in queue
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Queue ({jobs.length} job{jobs.length !== 1 ? "s" : ""})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <Badge
                variant="secondary"
                className={statusColors[job.status] ?? ""}
              >
                {job.currentStage ?? job.status}
              </Badge>
              <p className="min-w-0 flex-1 truncate text-sm">
                {job.prompt}
              </p>
              {job.error && (
                <span
                  className="max-w-40 truncate text-xs text-destructive"
                  title={job.error}
                >
                  {job.error}
                </span>
              )}
              <div className="flex gap-1">
                {job.status === "failed" && job.retryCount < 3 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRetry(job.id)}
                    title="Retry"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                {!["completed", "cancelled", "failed"].includes(
                  job.status,
                ) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onCancel(job.id)}
                    title="Cancel"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
