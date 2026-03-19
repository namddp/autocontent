import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface AccountInfo {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  status: string;
  has_api_key: boolean;
  last_used?: string;
  created_at: string;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const result = await invoke<AccountInfo[]>("list_accounts");
      setAccounts(result);
      setError(null);
    } catch (err) {
      setError(String(err));
    }
  }, []);

  const addAccountOAuth = useCallback(
    async (clientId: string, clientSecret: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const account = await invoke<AccountInfo>("add_account_oauth", {
          clientId,
          clientSecret,
        });
        setAccounts((prev) => [...prev, account]);
        return account;
      } catch (err) {
        setError(String(err));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const removeAccount = useCallback(async (accountId: string) => {
    try {
      await invoke("remove_account", { accountId });
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    } catch (err) {
      setError(String(err));
    }
  }, []);

  const setApiKey = useCallback(async (accountId: string, apiKey: string) => {
    try {
      await invoke("set_api_key", { accountId, apiKey });
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === accountId ? { ...a, has_api_key: true } : a,
        ),
      );
    } catch (err) {
      setError(String(err));
    }
  }, []);

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    addAccountOAuth,
    removeAccount,
    setApiKey,
  };
}
