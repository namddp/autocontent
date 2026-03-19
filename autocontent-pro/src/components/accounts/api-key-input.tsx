import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ApiKeyInputProps {
  accountId: string;
  onSave: (accountId: string, apiKey: string) => void;
  onCancel: () => void;
}

export function ApiKeyInput({ accountId, onSave, onCancel }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState("");

  const handleSave = () => {
    if (!apiKey.trim()) return;
    onSave(accountId, apiKey.trim());
    setApiKey("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Set Gemini API Key</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="gemini-key">API Key</Label>
          <input
            id="gemini-key"
            type="password"
            placeholder="Enter Gemini API key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Key will be encrypted and stored locally.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm">
            Save Key
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
