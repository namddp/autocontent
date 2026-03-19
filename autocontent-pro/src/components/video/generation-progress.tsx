import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, Download } from "lucide-react";

interface GenerationProgressProps {
  status: string;
  message: string;
}

const statusIcons: Record<string, typeof Loader2> = {
  generating: Loader2,
  downloading: Download,
  completed: CheckCircle,
};

export function GenerationProgress({
  status,
  message,
}: GenerationProgressProps) {
  const Icon = statusIcons[status] || Loader2;
  const isAnimated = status === "generating" || status === "downloading";

  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <Icon
          className={`h-5 w-5 ${isAnimated ? "animate-spin" : ""} ${
            status === "completed" ? "text-green-500" : "text-blue-500"
          }`}
        />
        <div>
          <p className="text-sm font-medium capitalize">{status}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
