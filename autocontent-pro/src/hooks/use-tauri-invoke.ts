import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

/// Generic hook for Tauri IPC calls with loading/error state
export function useTauriInvoke<T>(command: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (args?: Record<string, unknown>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await invoke<T>(command, args);
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [command],
  );

  return { data, loading, error, execute };
}
