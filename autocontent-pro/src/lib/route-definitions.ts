import {
  LayoutDashboard,
  Video,
  Users,
  Layers,
  HardDrive,
  Settings,
  ScrollText,
} from "lucide-react";

export const routes = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/generate", label: "Video Generate", icon: Video },
  { path: "/accounts", label: "Accounts", icon: Users },
  { path: "/batch", label: "Batch Processing", icon: Layers },
  { path: "/drive", label: "Google Drive", icon: HardDrive },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/logs", label: "Logs", icon: ScrollText },
] as const;
