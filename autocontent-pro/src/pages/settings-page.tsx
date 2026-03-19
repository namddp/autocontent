import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Settings } from "lucide-react";

export function SettingsPage() {
  return (
    <PageContainer title="Settings" description="App configuration and preferences">
      <EmptyState
        icon={Settings}
        title="Settings coming soon"
        description="API keys, proxy config, and app preferences"
      />
    </PageContainer>
  );
}
