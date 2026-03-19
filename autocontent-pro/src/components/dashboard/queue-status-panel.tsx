import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Layers } from "lucide-react";

export function QueueStatusPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Queue Status</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={Layers}
          title="Queue empty"
          description="Batch jobs will be displayed here"
        />
      </CardContent>
    </Card>
  );
}
