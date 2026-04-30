export function isTauriRuntime(): boolean {
  if (typeof window === "undefined") return false
  return "__TAURI_INTERNALS__" in window
}

export async function tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauriRuntime()) {
    throw new Error("Tauri runtime is not available in this browser session.")
  }
  const { invoke } = await import("@tauri-apps/api/core")
  return invoke<T>(command, args)
}

export async function openTauriDirectory(title: string): Promise<string | null> {
  if (!isTauriRuntime()) return null
  const { open } = await import("@tauri-apps/plugin-dialog")
  const selected = await open({
    directory: true,
    multiple: false,
    title,
  })
  return typeof selected === "string" ? selected : null
}
