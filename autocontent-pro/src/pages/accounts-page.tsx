import { useEffect, useState } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { AccountList } from "@/components/accounts/account-list";
import { AddAccountDialog } from "@/components/accounts/add-account-dialog";
import { ApiKeyInput } from "@/components/accounts/api-key-input";
import { useAccounts } from "@/hooks/use-accounts";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AccountsPage() {
  const {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    addAccountOAuth,
    removeAccount,
    setApiKey,
  } = useAccounts();

  const [showAddForm, setShowAddForm] = useState(false);
  const [apiKeyAccountId, setApiKeyAccountId] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAddAccount = async (
    clientId: string,
    clientSecret: string,
  ) => {
    const result = await addAccountOAuth(clientId, clientSecret);
    if (result) setShowAddForm(false);
  };

  const handleSetApiKey = async (accountId: string, apiKey: string) => {
    await setApiKey(accountId, apiKey);
    setApiKeyAccountId(null);
  };

  return (
    <PageContainer
      title="Accounts"
      description="Manage Google accounts and API keys"
    >
      <div className="space-y-4">
        {error && (
          <Card className="border-destructive">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <AccountList
          accounts={accounts}
          onAdd={() => setShowAddForm(true)}
          onRemove={removeAccount}
          onSetApiKey={(id) => setApiKeyAccountId(id)}
        />

        {showAddForm && (
          <AddAccountDialog
            onSubmit={handleAddAccount}
            isLoading={isLoading}
          />
        )}

        {apiKeyAccountId && (
          <ApiKeyInput
            accountId={apiKeyAccountId}
            onSave={handleSetApiKey}
            onCancel={() => setApiKeyAccountId(null)}
          />
        )}
      </div>
    </PageContainer>
  );
}
