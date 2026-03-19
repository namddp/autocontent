import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { PageContainer } from "@/components/shared/page-container";
import { BatchCreateForm } from "@/components/batch/batch-create-form";
import { BatchQueueTable } from "@/components/batch/batch-queue-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface QueueStatus {
  isRunning: boolean;
  isPaused: boolean;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
}

interface BatchJob {
  id: string;
  batchId: string;
  prompt: string;
  status: string;
  currentStage: string | null;
  error: string | null;
  retryCount: number;
}

export function BatchProcessingPage() {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [status, setStatus] = useState<QueueStatus | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [allJobs, queueStatus] = await Promise.all([
        invoke<BatchJob[]>("batch_get_all_jobs"),
        invoke<QueueStatus>("batch_get_status"),
      ]);
      setJobs(allJobs);
      setStatus(queueStatus);
    } catch {
      // Queue not initialized yet
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleCancel = async (jobId: string) => {
    await invoke("batch_cancel_job", { jobId });
    refreshData();
  };

  const handleRetry = async (jobId: string) => {
    await invoke("batch_retry_job", { jobId });
    refreshData();
  };

  const handlePause = async () => {
    await invoke("batch_pause");
    refreshData();
  };

  const handleResume = async () => {
    await invoke("batch_resume");
    refreshData();
  };

  return (
    <PageContainer
      title="Batch Processing"
      description="Queue and manage batch video jobs"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Queue status bar */}
          {status && status.totalJobs > 0 && (
            <Card>
              <CardContent className="flex items-center gap-4 py-3">
                <div className="flex-1 text-sm">
                  <span className="font-medium">{status.totalJobs}</span> total
                  {" · "}
                  <span className="text-blue-500">
                    {status.activeJobs} active
                  </span>
                  {" · "}
                  <span className="text-green-500">
                    {status.completedJobs} done
                  </span>
                  {status.failedJobs > 0 && (
                    <>
                      {" · "}
                      <span className="text-destructive">
                        {status.failedJobs} failed
                      </span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {status.isPaused ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResume}
                    >
                      <Play className="mr-1 h-3 w-3" /> Resume
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePause}
                    >
                      <Pause className="mr-1 h-3 w-3" /> Pause
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job queue */}
          <BatchQueueTable
            jobs={jobs}
            onCancel={handleCancel}
            onRetry={handleRetry}
          />
        </div>

        {/* Right column: create form */}
        <div>
          <BatchCreateForm onBatchCreated={() => refreshData()} />
        </div>
      </div>
    </PageContainer>
  );
}
