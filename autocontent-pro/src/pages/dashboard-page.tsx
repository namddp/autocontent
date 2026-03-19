import { PageContainer } from "@/components/shared/page-container";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentVideosPanel } from "@/components/dashboard/recent-videos-panel";
import { QueueStatusPanel } from "@/components/dashboard/queue-status-panel";
import { Users, Video, Layers, CheckCircle } from "lucide-react";

export function DashboardPage() {
  return (
    <PageContainer title="Dashboard" description="Overview of your video generation pipeline">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Accounts" value="0" icon={Users} />
        <StatCard title="Videos Generated" value="0" icon={Video} />
        <StatCard title="Queue" value="0 pending" icon={Layers} />
        <StatCard title="Completed" value="0" icon={CheckCircle} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentVideosPanel />
        <QueueStatusPanel />
      </div>
    </PageContainer>
  );
}
