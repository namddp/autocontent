import { invoke } from "@tauri-apps/api/core";

/// Type-safe Tauri IPC wrappers

export async function greet(name: string): Promise<string> {
  return invoke<string>("greet", { name });
}
