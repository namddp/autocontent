import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AddAccountDialogProps {
  onSubmit: (clientId: string, clientSecret: string) => void;
  isLoading: boolean;
}

export function AddAccountDialog({
  onSubmit,
  isLoading,
}: AddAccountDialogProps) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) return;
    onSubmit(clientId.trim(), clientSecret.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Google Account (OAuth2)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client-id">OAuth Client ID</Label>
            <input
              id="client-id"
              type="text"
              placeholder="your-client-id.apps.googleusercontent.com"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div>
            <Label htmlFor="client-secret">OAuth Client Secret</Label>
            <input
              id="client-secret"
              type="password"
              placeholder="Enter client secret..."
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Create OAuth credentials in Google Cloud Console. Your browser will
            open for authentication.
          </p>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Waiting for login...
              </>
            ) : (
              "Connect Google Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
