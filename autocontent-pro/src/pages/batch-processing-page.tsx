import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Layers } from "lucide-react";

export function BatchProcessingPage() {
  return (
    <PageContainer title="Batch Processing" description="Queue and manage batch video jobs">
      <EmptyState
        icon={Layers}
        title="No batch jobs"
        description="Phase 8 will implement batch processing queue"
      />
    </PageContainer>
  );
}
