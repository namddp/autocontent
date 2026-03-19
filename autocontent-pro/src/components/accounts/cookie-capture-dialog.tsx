import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Cookie,
  Loader2,
  CheckCircle2,
  XCircle,
  Globe,
} from "lucide-react";

interface CapturedCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number | null;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
}

interface CaptureResponse {
  cookies: CapturedCookie[];
  url: string;
  count: number;
}

type CaptureStatus = "idle" | "capturing" | "success" | "error";

interface CookieCaptureDialogProps {
  onCaptured: (cookies: CapturedCookie[]) => void;
  chromePath?: string;
  proxyServer?: string;
}

export function CookieCaptureDialog({
  onCaptured,
  chromePath,
  proxyServer,
}: CookieCaptureDialogProps) {
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [error, setError] = useState<string>("");
  const [cookieCount, setCookieCount] = useState(0);

  const handleCapture = async () => {
    setStatus("capturing");
    setError("");

    try {
      const result = await invoke<CaptureResponse>("cookie_capture", {
        request: {
          chrome_path: chromePath || null,
          proxy_server: proxyServer || null,
          timeout_ms: 300000,
        },
      });

      setCookieCount(result.count);
      setStatus("success");
      onCaptured(result.cookies);
    } catch (err) {
      setError(String(err));
      setStatus("error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Cookie className="h-4 w-4" />
          Đăng nhập Google Flow (Cookie)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Mở trình duyệt để đăng nhập Google. Cookie sẽ được trích xuất tự
          động sau khi đăng nhập thành công.
        </p>

        {status === "idle" && (
          <Button onClick={handleCapture} className="w-full">
            <Globe className="mr-2 h-4 w-4" />
            Mở trình duyệt đăng nhập
          </Button>
        )}

        {status === "capturing" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">
              Đang chờ đăng nhập Google...
            </p>
            <p className="text-xs text-muted-foreground">
              Hoàn tất đăng nhập trong cửa sổ trình duyệt vừa mở
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p className="text-sm font-medium text-green-700">
              Đăng nhập thành công!
            </p>
            <p className="text-xs text-muted-foreground">
              Đã lấy {cookieCount} cookies từ Google
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus("idle")}
            >
              Đăng nhập lại
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3">
              <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Lỗi đăng nhập
                </p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleCapture}
              className="w-full"
            >
              Thử lại
            </Button>
          </div>
        )}

        {chromePath && (
          <div className="rounded-md bg-muted p-2">
            <Label className="text-xs text-muted-foreground">
              Chrome: {chromePath}
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
