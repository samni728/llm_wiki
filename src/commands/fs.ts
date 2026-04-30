import type { FileNode, WikiProject } from "@/types/wiki"
import { isTauriRuntime, tauriInvoke } from "@/lib/runtime"

/** Raw shape returned by the Rust commands — id is attached client-side. */
interface RawProject {
  id?: string
  name: string
  path: string
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

function webProject(raw: RawProject): WikiProject {
  return {
    id: raw.id ?? raw.path,
    name: raw.name,
    path: raw.path,
  }
}

async function attachDesktopProjectIdentity(raw: RawProject): Promise<WikiProject> {
  const { ensureProjectId, upsertProjectInfo } = await import("@/lib/project-identity")
  const id = await ensureProjectId(raw.path)
  await upsertProjectInfo(id, raw.path, raw.name)
  return { id, name: raw.name, path: raw.path }
}

async function apiRequest<T>(
  path: string,
  options: { method?: HttpMethod; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`/api/llm-wiki${path}`, {
    method: options.method ?? "GET",
    credentials: "same-origin",
    headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`
    try {
      const payload = await res.json()
      detail = payload?.detail ?? payload?.message ?? detail
    } catch {
      // keep HTTP status text
    }
    throw new Error(`企业 Wiki 服务不可用：${detail}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function readFile(path: string): Promise<string> {
  if (isTauriRuntime()) return tauriInvoke<string>("read_file", { path })
  const payload = await apiRequest<{ contents: string }>("/fs/read", { method: "POST", body: { path } })
  return payload.contents
}

export async function writeFile(path: string, contents: string): Promise<void> {
  if (isTauriRuntime()) return tauriInvoke<void>("write_file", { path, contents })
  await apiRequest<void>("/fs/write", { method: "POST", body: { path, contents } })
}

export async function listDirectory(path: string): Promise<FileNode[]> {
  if (isTauriRuntime()) return tauriInvoke<FileNode[]>("list_directory", { path })
  const payload = await apiRequest<{ nodes: FileNode[] }>("/fs/list", { method: "POST", body: { path } })
  return payload.nodes
}

export async function copyFile(
  source: string,
  destination: string
): Promise<void> {
  if (isTauriRuntime()) return tauriInvoke("copy_file", { source, destination })
  throw new Error("浏览器入口暂不支持直接复制本机文件，请通过 OCR / MinerU 工作台导入资料。")
}

export async function uploadSourceFiles(
  projectPath: string,
  files: File[],
  targetDir: string = "raw/sources",
): Promise<Array<{ name: string; path: string; relative_path: string }>> {
  if (isTauriRuntime()) {
    throw new Error("桌面端请使用本地导入。")
  }
  const body = new FormData()
  body.append("project_path", projectPath)
  body.append("target_dir", targetDir)
  for (const file of files) {
    body.append("files", file)
  }
  const res = await fetch("/api/llm-wiki/sources/upload", {
    method: "POST",
    credentials: "same-origin",
    body,
  })
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`
    try {
      const payload = await res.json()
      detail = payload?.detail ?? payload?.message ?? detail
    } catch {
      // keep HTTP status text
    }
    throw new Error(`上传资料失败：${detail}`)
  }
  const payload = (await res.json()) as { files: Array<{ name: string; path: string; relative_path: string }> }
  return payload.files
}

export async function preprocessFile(path: string): Promise<string> {
  if (isTauriRuntime()) return tauriInvoke<string>("preprocess_file", { path })
  return readFile(path)
}

export async function deleteFile(path: string): Promise<void> {
  if (isTauriRuntime()) return tauriInvoke("delete_file", { path })
  await apiRequest<void>("/fs/delete", { method: "POST", body: { path } })
}

export async function findRelatedWikiPages(
  projectPath: string,
  sourceName: string
): Promise<string[]> {
  if (isTauriRuntime()) {
    return tauriInvoke<string[]>("find_related_wiki_pages", { projectPath, sourceName })
  }
  return []
}

export async function createDirectory(path: string): Promise<void> {
  if (isTauriRuntime()) return tauriInvoke<void>("create_directory", { path })
  await apiRequest<void>("/fs/mkdir", { method: "POST", body: { path } })
}

export async function fileExists(path: string): Promise<boolean> {
  if (isTauriRuntime()) return tauriInvoke<boolean>("file_exists", { path })
  const payload = await apiRequest<{ exists: boolean }>("/fs/exists", { method: "POST", body: { path } })
  return payload.exists
}

export async function createProject(
  name: string,
  path?: string,
): Promise<WikiProject> {
  if (isTauriRuntime()) {
    const raw = await tauriInvoke<RawProject>("create_project", { name, path })
    return attachDesktopProjectIdentity(raw)
  }
  const payload = await apiRequest<{ project: RawProject }>("/projects", { method: "POST", body: { name } })
  return webProject(payload.project)
}

export async function openProject(path: string): Promise<WikiProject> {
  if (isTauriRuntime()) {
    const raw = await tauriInvoke<RawProject>("open_project", { path })
    return attachDesktopProjectIdentity(raw)
  }
  const payload = await apiRequest<{ project: RawProject }>("/projects/open", { method: "POST", body: { path } })
  return webProject(payload.project)
}

export async function listProjects(): Promise<WikiProject[]> {
  if (isTauriRuntime()) return []
  const payload = await apiRequest<RawProject[] | { projects: RawProject[] }>("/projects")
  const projects = Array.isArray(payload) ? payload : payload.projects
  return projects.map(webProject)
}

export async function clipServerStatus(): Promise<string> {
  if (isTauriRuntime()) return tauriInvoke<string>("clip_server_status")
  return "企业 Wiki Web 服务"
}
