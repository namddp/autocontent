import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Video } from "lucide-react";

export function VideoGeneratePage() {
  return (
    <PageContainer title="Video Generate" description="Create AI videos with VEO3">
      <EmptyState
        icon={Video}
        title="VEO3 Integration Coming Soon"
        description="Phase 3 will implement video generation via Gemini API"
      />
    </PageContainer>
  );
}
