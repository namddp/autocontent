import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Video } from "lucide-react";

export function RecentVideosPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Videos</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={Video}
          title="No videos yet"
          description="Generated videos will appear here"
        />
      </CardContent>
    </Card>
  );
}
