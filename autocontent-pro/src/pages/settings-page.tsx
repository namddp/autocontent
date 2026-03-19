import { PageContainer } from "@/components/shared/page-container";
import { ProxySettings } from "@/components/settings/proxy-settings";
import { BrowserSettings } from "@/components/settings/browser-settings";

export function SettingsPage() {
  return (
    <PageContainer
      title="Settings"
      description="App configuration and preferences"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProxySettings />
        <BrowserSettings />
      </div>
    </PageContainer>
  );
}
