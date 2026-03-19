import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Globe, Camera } from "lucide-react";

export function BrowserSettings() {
  const [chromePath, setChromePath] = useState("");
  const [headless, setHeadless] = useState(true);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestScreenshot = async () => {
    if (!screenshotUrl.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      await invoke("browser_screenshot", {
        url: screenshotUrl,
        outputPath: "test-screenshot.png",
        proxy: null,
      });
      setTestResult("Screenshot saved to test-screenshot.png");
    } catch (err) {
      setTestResult(`Error: ${String(err)}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-5 w-5" />
          Browser Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Chrome/Chromium Path (optional)</Label>
          <input
            type="text"
            value={chromePath}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setChromePath(e.target.value)
            }
            placeholder="Auto-detect system Chrome"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave empty to use system default
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={headless}
            onChange={(e) => setHeadless(e.target.checked)}
            className="rounded"
          />
          Headless mode (no visible browser window)
        </label>

        <div className="border-t pt-4">
          <Label>Test Screenshot</Label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={screenshotUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setScreenshotUrl(e.target.value)
              }
              placeholder="https://example.com"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            />
            <Button
              size="sm"
              onClick={handleTestScreenshot}
              disabled={isTesting || !screenshotUrl.trim()}
            >
              <Camera className="mr-1 h-3 w-3" />
              {isTesting ? "..." : "Capture"}
            </Button>
          </div>
          {testResult && (
            <p
              className={`mt-2 text-xs ${testResult.startsWith("Error") ? "text-destructive" : "text-green-500"}`}
            >
              {testResult}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
