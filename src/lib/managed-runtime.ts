import i18n from "@/i18n"
import { isTauriRuntime } from "@/lib/runtime"
import { useWikiStore, type LlmConfig, type WikiPermissions } from "@/stores/wiki-store"

export interface ManagedRuntimeConfig {
  enabled: boolean
  mode: "managed" | "self_managed"
  permissions?: WikiPermissions
  llm?: {
    base_url: string
    model: string
    context_window?: number
  }
  embedding?: {
    enabled?: boolean
    base_url: string
    model: string
  }
  rerank?: {
    enabled?: boolean
    base_url: string
    model: string
  }
  ui?: {
    language?: string
    output_language?: "Chinese"
    settings_mode?: "managed" | "editable"
    product_name?: string
  }
  capabilities?: {
    managed_workspace?: boolean
    settings_managed_by_backend?: boolean
  }
}

export async function loadManagedRuntimeConfig(): Promise<ManagedRuntimeConfig | null> {
  if (isTauriRuntime()) return null
  try {
    const response = await fetch("/api/llm-wiki/runtime-config", {
      credentials: "same-origin",
    })
    if (!response.ok) return null
    const payload = (await response.json()) as ManagedRuntimeConfig
    if (!payload.enabled) return null
    return payload
  } catch {
    return null
  }
}

export async function applyManagedRuntimeConfig(config: ManagedRuntimeConfig): Promise<void> {
  const store = useWikiStore.getState()
  const llm: LlmConfig = {
    provider: "custom",
    apiKey: "",
    model: config.llm?.model ?? "",
    ollamaUrl: "",
    customEndpoint: config.llm?.base_url ?? "/api/llm-wiki/llm",
    maxContextSize: config.llm?.context_window ?? 200000,
    apiMode: "chat_completions",
  }
  store.setLlmConfig(llm)
  store.setProviderConfigs({
    yanse_managed: {
      model: llm.model,
      baseUrl: llm.customEndpoint,
      apiMode: "chat_completions",
      maxContextSize: llm.maxContextSize,
    },
  })
  store.setActivePresetId("yanse_managed")
  store.setSearchApiConfig({ provider: "none", apiKey: "" })
  store.setEmbeddingConfig({
    enabled: Boolean(config.embedding?.enabled),
    endpoint: config.embedding?.base_url ?? "/api/llm-wiki/embeddings",
    apiKey: "",
    model: config.embedding?.model ?? "",
  })
  store.setPermissions(config.permissions ?? null)
  store.setOutputLanguage(config.ui?.output_language ?? "Chinese")
  if ((config.ui?.language ?? "zh") !== i18n.language) {
    await i18n.changeLanguage(config.ui?.language ?? "zh")
  }
}

export function isManagedRuntime(config: ManagedRuntimeConfig | null): boolean {
  return Boolean(config?.capabilities?.settings_managed_by_backend)
}
