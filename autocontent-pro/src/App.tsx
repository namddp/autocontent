import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardPage } from "@/pages/dashboard-page";
import { VideoGeneratePage } from "@/pages/video-generate-page";
import { AccountsPage } from "@/pages/accounts-page";
import { BatchProcessingPage } from "@/pages/batch-processing-page";
import { GoogleDrivePage } from "@/pages/google-drive-page";
import { SettingsPage } from "@/pages/settings-page";
import { LogsPage } from "@/pages/logs-page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/generate" element={<VideoGeneratePage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/batch" element={<BatchProcessingPage />} />
          <Route path="/drive" element={<GoogleDrivePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
