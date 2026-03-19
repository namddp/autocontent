import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, TestTube, Shield } from "lucide-react";

interface Proxy {
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol: string;
  status?: string;
}

export function ProxySettings() {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [newProxy, setNewProxy] = useState("");
  const [testing, setTesting] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const addProxy = () => {
    if (!newProxy.trim()) return;
    // Parse format: protocol://user:pass@host:port
    const match = newProxy.match(
      /^(https?|socks5):\/\/(?:([^:]+):([^@]+)@)?([^:]+):(\d+)$/,
    );
    if (!match) {
      setParseError("Invalid format. Use: protocol://[user:pass@]host:port");
      return;
    }
    setParseError(null);

    setProxies([
      ...proxies,
      {
        protocol: match[1],
        username: match[2],
        password: match[3],
        host: match[4],
        port: parseInt(match[5]),
      },
    ]);
    setNewProxy("");
  };

  const testProxy = async (index: number) => {
    setTesting(index);
    try {
      const ip = await invoke<string>("browser_test_proxy", {
        proxy: proxies[index],
      });
      const updated = [...proxies];
      updated[index].status = `OK (${ip.trim()})`;
      setProxies(updated);
    } catch {
      const updated = [...proxies];
      updated[index].status = "Failed";
      setProxies(updated);
    } finally {
      setTesting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-5 w-5" />
          Proxy Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newProxy}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProxy(e.target.value)
            }
            placeholder="http://user:pass@host:port"
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          />
          <Button onClick={addProxy} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {parseError && (
          <p className="text-xs text-destructive">{parseError}</p>
        )}

        <div className="space-y-2">
          {proxies.map((proxy, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <span className="font-mono text-sm">
                {proxy.protocol}://{proxy.host}:{proxy.port}
              </span>
              <div className="flex items-center gap-2">
                {proxy.status && (
                  <Badge
                    variant={
                      proxy.status.startsWith("OK")
                        ? "default"
                        : "destructive"
                    }
                  >
                    {proxy.status}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testProxy(idx)}
                  disabled={testing === idx}
                >
                  <TestTube className="h-3 w-3" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setProxies(proxies.filter((_, i) => i !== idx))
                  }
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {proxies.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No proxies configured. Direct connection will be used.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
