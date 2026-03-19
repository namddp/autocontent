import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { History } from "lucide-react";

export function VideoHistory() {
  // Will be populated from SQLite in Phase 4
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Generation History</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={History}
          title="No history yet"
          description="Generated videos will appear here"
        />
      </CardContent>
    </Card>
  );
}
