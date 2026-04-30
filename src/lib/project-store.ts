import type { WikiProject } from "@/types/wiki"
import type { LlmConfig, SearchApiConfig, EmbeddingConfig, OutputLanguage, ProviderConfigs } from "@/stores/wiki-store"
import { isTauriRuntime } from "@/lib/runtime"

const STORE_NAME = "app-state.json"
const RECENT_PROJECTS_KEY = "recentProjects"
const LAST_PROJECT_KEY = "lastProject"

async function getStore() {
  const { load } = await import("@tauri-apps/plugin-store")
  return load(STORE_NAME, { autoSave: true, defaults: {} })
}

function storageGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(`${STORE_NAME}:${key}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function storageSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(`${STORE_NAME}:${key}`, JSON.stringify(value))
}

export async function getRecentProjects(): Promise<WikiProject[]> {
  if (!isTauriRuntime()) return storageGet<WikiProject[]>(RECENT_PROJECTS_KEY) ?? []
  const store = await getStore()
  const projects = await store.get<WikiProject[]>(RECENT_PROJECTS_KEY)
  return projects ?? []
}

export async function getLastProject(): Promise<WikiProject | null> {
  if (!isTauriRuntime()) return storageGet<WikiProject>(LAST_PROJECT_KEY)
  const store = await getStore()
  const project = await store.get<WikiProject>(LAST_PROJECT_KEY)
  return project ?? null
}

export async function saveLastProject(project: WikiProject): Promise<void> {
  if (!isTauriRuntime()) {
    storageSet(LAST_PROJECT_KEY, project)
    await addToRecentProjects(project)
    return
  }
  const store = await getStore()
  await store.set(LAST_PROJECT_KEY, project)
  await addToRecentProjects(project)
}

export async function addToRecentProjects(
  project: WikiProject
): Promise<void> {
  if (!isTauriRuntime()) {
    const existing = storageGet<WikiProject[]>(RECENT_PROJECTS_KEY) ?? []
    const filtered = existing.filter((p) => p.path !== project.path)
    storageSet(RECENT_PROJECTS_KEY, [project, ...filtered].slice(0, 10))
    return
  }
  const store = await getStore()
  const existing = (await store.get<WikiProject[]>(RECENT_PROJECTS_KEY)) ?? []
  const filtered = existing.filter((p) => p.path !== project.path)
  const updated = [project, ...filtered].slice(0, 10)
  await store.set(RECENT_PROJECTS_KEY, updated)
}

const LLM_CONFIG_KEY = "llmConfig"
const PROVIDER_CONFIGS_KEY = "providerConfigs"
const ACTIVE_PRESET_KEY = "activePresetId"

export async function saveLlmConfig(config: LlmConfig): Promise<void> {
  if (!isTauriRuntime()) {
    storageSet(LLM_CONFIG_KEY, config)
    return
  }
  const store = await getStore()
  await store.set(LLM_CONFIG_KEY, config)
}

export async function loadLlmConfig(): Promise<LlmConfig | null> {
  if (!isTauriRuntime()) return storageGet<LlmConfig>(LLM_CONFIG_KEY)
  const store = await getStore()
  return (await store.get<LlmConfig>(LLM_CONFIG_KEY)) ?? null
}

export async function saveProviderConfigs(configs: ProviderConfigs): Promise<void> {
  if (!isTauriRuntime()) {
    storageSet(PROVIDER_CONFIGS_KEY, configs)
    return
  }
  const store = await getStore()
  await store.set(PROVIDER_CONFIGS_KEY, configs)
}

export async function loadProviderConfigs(): Promise<ProviderConfigs | null> {
  if (!isTauriRuntime()) return storageGet<ProviderConfigs>(PROVIDER_CONFIGS_KEY)
  const store = await getStore()
  return (await store.get<ProviderConfigs>(PROVIDER_CONFIGS_KEY)) ?? null
}

export async function saveActivePresetId(id: string | null): Promise<void> {
  if (!isTauriRuntime()) {
    storageSet(ACTIVE_PRESET_KEY, id)
    return
  }
  const store = await getStore()
  await store.set(ACTIVE_PRESET_KEY, id)
}

export async function loadActivePresetId(): Promise<string | null> {
  if (!isTauriRuntime()) return storageGet<string | null>(ACTIVE_PRESET_KEY)
  const store = await getStore()
  return (await store.get<string | null>(ACTIVE_PRESET_KEY)) ?? null
}

const SEARCH_API_KEY = "searchApiConfig"

export async function saveSearchApiConfig(config: SearchApiConfig): Promise<void> {
  if (!isTauriRuntime()) {
    storageSet(SEARCH_API_KEY, config)
    return
  }
  const store = await getStore()
  await store.set(SEARCH_API_KEY, config)
}

export async function loadSearchApiConfig(): Promise<SearchApiConfig | null> {
  if (!isTauriRuntime()) return storageGet<SearchApiConfig>(SEARCH_API_KEY)
  const store = await getStore()
  return (await store.get<SearchApiConfig>(SEARCH_API_KEY)) ?? null
}

const EMBEDDING_KEY = "embeddingConfig"

export async function saveEmbeddingConfig(config: EmbeddingConfig): Promise<void> {
  if (!isTauriRuntime()) {
    storageSet(EMBEDDING_KEY, config)
    return
  }
  const store = await getStore()
  await store.set(EMBEDDING_KEY, config)
}

export async function loadEmbeddingConfig(): Promise<EmbeddingConfig | null> {
  if (!isTauriRuntime()) return storageGet<EmbeddingConfig>(EMBEDDING_KEY)
  const store = await getStore()
  return (await store.get<EmbeddingConfig>(EMBEDDING_KEY)) ?? null
}

export async function removeFromRecentProjects(
  path: string
): Promise<void> {
  if (!isTauriRuntime()) {
    const existing = storageGet<WikiProject[]>(RECENT_PROJECTS_KEY) ?? []
    storageSet(RECENT_PROJECTS_KEY, existing.filter((p) => p.path !== path))
    return
  }
  const store = await getStore()
  const existing = (await store.get<WikiProject[]>(RECENT_PROJECTS_KEY)) ?? []
  const updated = existing.filter((p) => p.path !== path)
  await store.set(RECENT_PROJECTS_KEY, updated)
}

const LANGUAGE_KEY = "language"

export async function saveLanguage(lang: string): Promise<void> {
  if (!isTauriRuntime()) {
    storageSet(LANGUAGE_KEY, lang)
    return
  }
  const store = await getStore()
  await store.set(LANGUAGE_KEY, lang)
}

export async function loadLanguage(): Promise<string | null> {
  if (!isTauriRuntime()) return storageGet<string>(LANGUAGE_KEY)
  const store = await getStore()
  return (await store.get<string>(LANGUAGE_KEY)) ?? null
}

const OUTPUT_LANGUAGE_KEY = "outputLanguage"

export async function saveOutputLanguage(lang: OutputLanguage): Promise<void> {
  if (!isTauriRuntime()) {
    storageSet(OUTPUT_LANGUAGE_KEY, lang)
    return
  }
  const store = await getStore()
  await store.set(OUTPUT_LANGUAGE_KEY, lang)
}

export async function loadOutputLanguage(): Promise<OutputLanguage | null> {
  if (!isTauriRuntime()) return storageGet<OutputLanguage>(OUTPUT_LANGUAGE_KEY)
  const store = await getStore()
  return (await store.get<OutputLanguage>(OUTPUT_LANGUAGE_KEY)) ?? null
}

// ── Update-check persistence ──────────────────────────────────────────────
// Small slice of state the UI-layer update store hydrates from on boot.
// Only fields that should persist across launches: the user's "enable
// auto-check" toggle, the timestamp we last checked (so the 6-hour cache
// survives restarts), and the version the user explicitly dismissed
// (so we don't re-nag on every restart until a newer version is out).

const UPDATE_CHECK_STATE_KEY = "updateCheckState"

export interface PersistedUpdateCheckState {
  enabled: boolean
  lastCheckedAt: number | null
  dismissedVersion: string | null
}

export async function saveUpdateCheckState(
  state: PersistedUpdateCheckState,
): Promise<void> {
  if (!isTauriRuntime()) {
    storageSet(UPDATE_CHECK_STATE_KEY, state)
    return
  }
  const store = await getStore()
  await store.set(UPDATE_CHECK_STATE_KEY, state)
}

export async function loadUpdateCheckState(): Promise<PersistedUpdateCheckState | null> {
  if (!isTauriRuntime()) return storageGet<PersistedUpdateCheckState>(UPDATE_CHECK_STATE_KEY)
  const store = await getStore()
  return (
    (await store.get<PersistedUpdateCheckState>(UPDATE_CHECK_STATE_KEY)) ?? null
  )
}
