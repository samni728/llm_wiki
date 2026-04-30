import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProject, writeFile, createDirectory } from "@/commands/fs"
import { getTemplate } from "@/lib/templates"
import { TemplatePicker } from "@/components/project/template-picker"
import type { WikiProject } from "@/types/wiki"
import { normalizePath } from "@/lib/path-utils"
import { useTranslation } from "react-i18next"
import { isTauriRuntime } from "@/lib/runtime"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (project: WikiProject) => void
}

export function CreateProjectDialog({ open: isOpen, onOpenChange, onCreated }: CreateProjectDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [path] = useState("./data/llm_wiki_projects")
  const [selectedTemplate, setSelectedTemplate] = useState("enterprise")
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!name.trim()) {
      setError("请填写 Wiki 名称。")
      return
    }
    setCreating(true)
    setError("")
    try {
      const project = await createProject(name.trim(), isTauriRuntime() ? path.trim() : undefined)
      const pp = normalizePath(project.path)

      const template = getTemplate(selectedTemplate)
      await writeFile(`${pp}/schema.md`, template.schema)
      await writeFile(`${pp}/purpose.md`, template.purpose)
      for (const dir of template.extraDirs) {
        await createDirectory(`${pp}/${dir}`)
      }

      onCreated(project)
      onOpenChange(false)
      setName("")
      setSelectedTemplate("enterprise")
    } catch (err) {
      setError(String(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("project.createTitle")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t("project.name")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("project.namePlaceholder")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("project.template")}</Label>
            <TemplatePicker selected={selectedTemplate} onSelect={setSelectedTemplate} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("project.parentDir")}</Label>
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              企业 Wiki 工作区
            </div>
            <p className="text-xs text-muted-foreground">
              新 Wiki 会创建在企业统一配置的工作区中，具体存储位置由管理员在服务端维护。
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("project.cancel")}</Button>
          <Button onClick={handleCreate} disabled={creating}>{creating ? t("project.creating") : t("project.create")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
