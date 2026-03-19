import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Key } from "lucide-react";

interface Account {
  id: string;
  email: string;
  display_name?: string;
  status: string;
  has_api_key: boolean;
}

interface AccountListProps {
  accounts: Account[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onSetApiKey: (id: string) => void;
}

export function AccountList({
  accounts,
  onAdd,
  onRemove,
  onSetApiKey,
}: AccountListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Google Accounts</CardTitle>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No accounts added yet. Click "Add Account" to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{account.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.display_name || "No name"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      account.status === "active" ? "default" : "destructive"
                    }
                  >
                    {account.status}
                  </Badge>
                  {account.has_api_key && (
                    <Badge variant="outline">API Key</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSetApiKey(account.id)}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemove(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
