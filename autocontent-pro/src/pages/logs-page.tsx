import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { ScrollText } from "lucide-react";

export function LogsPage() {
  return (
    <PageContainer title="Logs" description="Application logs and activity history">
      <EmptyState
        icon={ScrollText}
        title="No logs yet"
        description="Activity and error logs will appear here"
      />
    </PageContainer>
  );
}
