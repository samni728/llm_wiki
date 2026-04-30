import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Bot,
  Binary,
  Globe,
  Languages,
  Palette,
  Info,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n"
import { Button } from "@/components/ui/button"
import { useWikiStore } from "@/stores/wiki-store"
import { useChatStore } from "@/stores/chat-store"
import { saveLanguage } from "@/lib/project-store"
import { isManagedRuntime, loadManagedRuntimeConfig, type ManagedRuntimeConfig } from "@/lib/managed-runtime"
import type { SettingsDraft, DraftSetter } from "./settings-types"
import { LlmProviderSection } from "./sections/llm-provider-section"
import { EmbeddingSection } from "./sections/embedding-section"
import { WebSearchSection } from "./sections/web-search-section"
import { OutputSection } from "./sections/output-section"
import { InterfaceSection } from "./sections/interface-section"
import { AboutSection } from "./sections/about-section"

type CategoryId =
  | "llm"
  | "embedding"
  | "web-search"
  | "output"
  | "interface"
  | "about"

interface Category {
  id: CategoryId
  /** i18n key under settings.categories — resolved at render time so
   *  switching language in Settings → Interface takes effect without
   *  remounting this component (Bug #53). */
  labelKey: string
  icon: typeof Bot
}

const CATEGORIES: Category[] = [
  { id: "llm", labelKey: "settings.categories.llm", icon: Bot },
  { id: "embedding", labelKey: "settings.categories.embedding", icon: Binary },
  { id: "web-search", labelKey: "settings.categories.webSearch", icon: Globe },
  { id: "output", labelKey: "settings.categories.output", icon: Languages },
  { id: "interface", labelKey: "settings.categories.interface", icon: Palette },
  { id: "about", labelKey: "settings.categories.about", icon: Info },
]

function initialDraft(
  llm: ReturnType<typeof useWikiStore.getState>["llmConfig"],
  search: ReturnType<typeof useWikiStore.getState>["searchApiConfig"],
  embed: ReturnType<typeof useWikiStore.getState>["embeddingConfig"],
  outputLanguage: ReturnType<typeof useWikiStore.getState>["outputLanguage"],
  maxHistoryMessages: number,
  uiLanguage: string,
): SettingsDraft {
  return {
    provider: llm.provider,
    apiKey: llm.apiKey,
    model: llm.model,
    ollamaUrl: llm.ollamaUrl,
    customEndpoint: llm.customEndpoint,
    maxContextSize: llm.maxContextSize ?? 204800,
    apiMode: llm.apiMode,
    embeddingEnabled: embed.enabled,
    embeddingEndpoint: embed.endpoint,
    embeddingApiKey: embed.apiKey,
    embeddingModel: embed.model,
    searchProvider: search.provider,
    searchApiKey: search.apiKey,
    outputLanguage,
    maxHistoryMessages,
    uiLanguage,
  }
}

export function SettingsView() {
  const { t } = useTranslation()
  const llmConfig = useWikiStore((s) => s.llmConfig)
  const setLlmConfig = useWikiStore((s) => s.setLlmConfig)
  const searchApiConfig = useWikiStore((s) => s.searchApiConfig)
  const setSearchApiConfig = useWikiStore((s) => s.setSearchApiConfig)
  const embeddingConfig = useWikiStore((s) => s.embeddingConfig)
  const setEmbeddingConfig = useWikiStore((s) => s.setEmbeddingConfig)
  const outputLanguage = useWikiStore((s) => s.outputLanguage)
  const setOutputLanguage = useWikiStore((s) => s.setOutputLanguage)
  const maxHistoryMessages = useChatStore((s) => s.maxHistoryMessages)
  const setMaxHistoryMessages = useChatStore((s) => s.setMaxHistoryMessages)

  const [active, setActive] = useState<CategoryId>("llm")
  const [saved, setSaved] = useState(false)
  const [managedRuntime, setManagedRuntime] = useState<ManagedRuntimeConfig | null>(null)
  const [draft, setDraftState] = useState<SettingsDraft>(() =>
    initialDraft(
      llmConfig,
      searchApiConfig,
      embeddingConfig,
      outputLanguage,
      maxHistoryMessages,
      i18n.language,
    ),
  )

  useEffect(() => {
    loadManagedRuntimeConfig().then(setManagedRuntime).catch(() => setManagedRuntime(null))
  }, [])

  // Resync draft from store if it changes out-of-band (e.g. project switch).
  useEffect(() => {
    setDraftState(
      initialDraft(
        llmConfig,
        searchApiConfig,
        embeddingConfig,
        outputLanguage,
        maxHistoryMessages,
        i18n.language,
      ),
    )
  }, [
    llmConfig,
    searchApiConfig,
    embeddingConfig,
    outputLanguage,
    maxHistoryMessages,
  ])

  const setDraft: DraftSetter = useCallback((key, value) => {
    setDraftState((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    const {
      saveLlmConfig,
      saveSearchApiConfig,
      saveEmbeddingConfig,
      saveOutputLanguage,
    } = await import("@/lib/project-store")

    const newLlm = {
      provider: draft.provider,
      apiKey: draft.apiKey,
      model: draft.model,
      ollamaUrl: draft.ollamaUrl,
      customEndpoint: draft.customEndpoint,
      maxContextSize: draft.maxContextSize,
      apiMode: draft.provider === "custom" ? draft.apiMode : undefined,
    }
    const newSearch = { provider: draft.searchProvider, apiKey: draft.searchApiKey }
    const newEmbed = {
      enabled: draft.embeddingEnabled,
      endpoint: draft.embeddingEndpoint,
      apiKey: draft.embeddingApiKey,
      model: draft.embeddingModel,
    }

    setLlmConfig(newLlm)
    await saveLlmConfig(newLlm)
    setSearchApiConfig(newSearch)
    await saveSearchApiConfig(newSearch)
    setEmbeddingConfig(newEmbed)
    await saveEmbeddingConfig(newEmbed)
    setOutputLanguage(draft.outputLanguage as typeof outputLanguage)
    await saveOutputLanguage(draft.outputLanguage as typeof outputLanguage)
    setMaxHistoryMessages(draft.maxHistoryMessages)

    if (draft.uiLanguage !== i18n.language) {
      await i18n.changeLanguage(draft.uiLanguage)
      await saveLanguage(draft.uiLanguage)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [
    draft,
    setLlmConfig,
    setSearchApiConfig,
    setEmbeddingConfig,
    setOutputLanguage,
    setMaxHistoryMessages,
    outputLanguage,
  ])

  const body = useMemo(() => {
    if (isManagedRuntime(managedRuntime)) {
      return <ManagedEnterpriseSettings config={managedRuntime as ManagedRuntimeConfig} />
    }
    switch (active) {
      case "llm":
        // The LLM section manages its own store state (per-provider
        // configs + active preset) and persists directly — it bypasses
        // the shared draft / global Save button.
        return <LlmProviderSection />
      case "embedding":
        return <EmbeddingSection draft={draft} setDraft={setDraft} />
      case "web-search":
        return <WebSearchSection draft={draft} setDraft={setDraft} />
      case "output":
        return <OutputSection draft={draft} setDraft={setDraft} />
      case "interface":
        return <InterfaceSection draft={draft} setDraft={setDraft} />
      case "about":
        return <AboutSection />
    }
  }, [active, draft, managedRuntime, setDraft])

  const categories = isManagedRuntime(managedRuntime)
    ? CATEGORIES.filter((category) => category.id === "llm")
    : CATEGORIES

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar — category nav. Matches the IconSidebar's pill-on-accent
          pattern so the two navigational surfaces feel like one app. */}
      <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30">
        <div className="px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("settings.title")}
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-3">
          {categories.map((c) => {
            const Icon = c.icon
            const isActive = c.id === active
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(c.id)}
                aria-current={isActive ? "page" : undefined}
                className={`group mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-foreground/[0.08] font-medium text-foreground ring-1 ring-border/70"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground/80 group-hover:text-accent-foreground"
                  }`}
                />
                <span className="truncate">{t(c.labelKey)}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto max-w-2xl">{body}</div>
        </div>

        {/* Global Save bar hidden for sections that persist inline:
            - "llm" saves per-row on every edit (independent per-preset state)
            - "about" has no editable fields */}
        {!isManagedRuntime(managedRuntime) && active !== "about" && active !== "llm" && (
          <div className="shrink-0 border-t bg-background/80 backdrop-blur px-8 py-3">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                {saved ? t("settings.savedTick") : t("settings.changeHint")}
              </p>
              <Button onClick={handleSave}>
                {saved ? t("settings.saved") : t("settings.save")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ManagedEnterpriseSettings({ config }: { config: ManagedRuntimeConfig }) {
  const permissions = config.permissions
  const rows = [
    ["模型配置", config.llm?.model || "后台未配置"],
    ["模型入口", "由妍色智能系统后台统一代理"],
    ["向量嵌入", config.embedding?.enabled ? config.embedding.model : "后台未启用"],
    ["Rerank", config.rerank?.enabled ? config.rerank.model : "后台未启用"],
    ["网页搜索", "默认关闭，由管理员后台统一控制"],
    ["输出语言", "简体中文"],
    ["工作区", "企业 Wiki 工作区"],
  ]
  const permissionRows = [
    ["只读 / 查询", permissions?.read],
    ["写入", permissions?.write],
    ["更新", permissions?.update],
    ["删除", permissions?.delete],
    ["Wiki 管理", permissions?.admin],
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">企业 Wiki 配置</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          当前实例由妍色智能系统后台统一管理模型、向量、权限、语言和工作区。员工侧只负责创建、阅读和维护被授权的企业知识。
        </p>
      </div>

      <div className="rounded-md border divide-y">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-right text-sm font-medium">{value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-md border p-4">
        <div className="text-sm font-medium">当前账号权限</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {permissionRows.map(([label, allowed]) => (
            <div key={label as string} className="rounded border bg-muted/20 px-3 py-2 text-sm">
              <span className="text-muted-foreground">{label as string}</span>
              <span className={`ml-2 font-medium ${allowed ? "text-emerald-600" : "text-muted-foreground"}`}>
                {allowed ? "允许" : "禁止"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
