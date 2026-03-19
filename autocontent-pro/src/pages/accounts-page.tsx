import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export function AccountsPage() {
  return (
    <PageContainer title="Accounts" description="Manage Google accounts and OAuth tokens">
      <EmptyState
        icon={Users}
        title="No accounts connected"
        description="Phase 4 will implement multi-account OAuth2 management"
      />
    </PageContainer>
  );
}
