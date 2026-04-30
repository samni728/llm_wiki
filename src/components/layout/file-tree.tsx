import { useState, type MouseEvent } from "react"
import { BookOpen, ChevronRight, ChevronDown, File, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWikiStore } from "@/stores/wiki-store"
import type { FileNode } from "@/types/wiki"
import { useTranslation } from "react-i18next"
import { isTauriRuntime } from "@/lib/runtime"
import { normalizePath } from "@/lib/path-utils"
import { startIngest } from "@/lib/ingest"
import { enqueueIngest } from "@/lib/ingest-queue"

function TreeNode({ node, depth }: { node: FileNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1)
  const project = useWikiStore((s) => s.project)
  const selectedFile = useWikiStore((s) => s.selectedFile)
  const setSelectedFile = useWikiStore((s) => s.setSelectedFile)
  const setActiveView = useWikiStore((s) => s.setActiveView)
  const setChatExpanded = useWikiStore((s) => s.setChatExpanded)
  const llmConfig = useWikiStore((s) => s.llmConfig)
  const permissions = useWikiStore((s) => s.permissions)

  const isSelected = selectedFile === node.path
  const paddingLeft = 12 + depth * 16
  const isRawSource = normalizePath(node.path).includes("/raw/sources/")
  const canIngest = isRawSource && (isTauriRuntime() || Boolean(permissions?.admin))

  async function handleIngest(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (!project) return
    setChatExpanded(true)
    setActiveView("wiki")
    try {
      if (isTauriRuntime()) {
        await startIngest(normalizePath(project.path), node.path, llmConfig)
      } else {
        await enqueueIngest(project.id, node.path)
      }
    } catch (err) {
      window.alert(`提取到 Wiki 失败：${err}`)
    }
  }

  if (node.is_dir) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1 py-1 text-sm text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
          style={{ paddingLeft }}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          )}
          <Folder className="h-3.5 w-3.5 shrink-0 text-blue-400" />
          <span className="truncate">{node.name}</span>
        </button>
        {expanded && node.children?.map((child) => (
          <TreeNode key={child.path} node={child} depth={depth + 1} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`flex w-full items-center gap-1 py-1 text-sm ${
        isSelected
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
      }`}
      style={{ paddingLeft: paddingLeft + 14 }}
    >
      <button
        onClick={() => setSelectedFile(node.path)}
        className="flex min-w-0 flex-1 items-center gap-1 text-left"
      >
        <File className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>
      {canIngest && (
        <Button
          variant="ghost"
          size="icon"
          className="mr-1 h-7 w-7 shrink-0"
          title="Ingest"
          onClick={handleIngest}
        >
          <BookOpen className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

export function FileTree() {
  const { t } = useTranslation()
  const fileTree = useWikiStore((s) => s.fileTree)
  const project = useWikiStore((s) => s.project)

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
        {t("fileTree.noProject")}
      </div>
    )
  }

  return (
    <ScrollArea className="h-full min-w-0 overflow-hidden">
      <div className="p-2">
        <div className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
          {project.name}
        </div>
        {fileTree.map((node) => (
          <TreeNode key={node.path} node={node} depth={0} />
        ))}
      </div>
    </ScrollArea>
  )
}
