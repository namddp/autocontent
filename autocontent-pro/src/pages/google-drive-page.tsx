import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { HardDrive } from "lucide-react";

export function GoogleDrivePage() {
  return (
    <PageContainer title="Google Drive" description="Upload and manage files on Google Drive">
      <EmptyState
        icon={HardDrive}
        title="Not connected"
        description="Phase 7 will implement Google Drive integration"
      />
    </PageContainer>
  );
}
