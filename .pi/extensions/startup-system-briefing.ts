import * as fs from "node:fs"
import * as path from "node:path"
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent"
import { DEFAULT_MAX_LINES, truncateHead } from "@earendil-works/pi-coding-agent"

const MAX_FILE_BYTES = 18 * 1024
const MAX_ITEMS_PER_SECTION = 4

type DatedFile = {
  date: string
  relativePath: string
  absolutePath: string
}

function isPrintMode() {
  const args = process.argv.slice(2)
  return args.includes("-p") || args.includes("--print") || args.includes("--mode=json") || args.includes("--mode") && args.includes("json")
}

function todayInShanghai() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === "year")?.value ?? "1970"
  const month = parts.find((part) => part.type === "month")?.value ?? "01"
  const day = parts.find((part) => part.type === "day")?.value ?? "01"
  return `${year}-${month}-${day}`
}

async function pathExists(abs: string) {
  try {
    await fs.promises.access(abs)
    return true
  } catch {
    return false
  }
}

async function readText(abs: string) {
  try {
    const raw = await fs.promises.readFile(abs, "utf8")
    const truncation = truncateHead(raw, {
      maxBytes: MAX_FILE_BYTES,
      maxLines: DEFAULT_MAX_LINES,
    })

    let content = truncation.content
    if (truncation.truncated) {
      content += `\n\n[内容已截断: ${truncation.outputLines}/${truncation.totalLines} 行]`
    }
    return content.trim()
  } catch {
    return ""
  }
}

async function listDatedMarkdownFiles(cwd: string, relativeDir: string): Promise<DatedFile[]> {
  const dir = path.resolve(cwd, relativeDir)
  let entries: fs.Dirent[]

  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }

  return entries
    .filter((entry) => entry.isFile() && /^\d{4}-\d{2}-\d{2}\.md$/.test(entry.name))
    .map((entry) => {
      const absolutePath = path.join(dir, entry.name)
      return {
        date: entry.name.replace(/\.md$/, ""),
        relativePath: path.join(relativeDir, entry.name),
        absolutePath,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

async function latestFiles(cwd: string, relativeDir: string, limit: number) {
  const dir = path.resolve(cwd, relativeDir)
  const files: Array<{ relativePath: string; absolutePath: string; mtimeMs: number }> = []

  async function walk(current: string) {
    let entries: fs.Dirent[]
    try {
      entries = await fs.promises.readdir(current, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const abs = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(abs)
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const stat = await fs.promises.stat(abs)
        files.push({
          absolutePath: abs,
          relativePath: path.relative(cwd, abs),
          mtimeMs: stat.mtimeMs,
        })
      }
    }
  }

  await walk(dir)
  return files.sort((a, b) => b.mtimeMs - a.mtimeMs).slice(0, limit)
}

async function unreadInboxFiles(cwd: string, limit: number) {
  const files = await latestFiles(cwd, "os/inbox", 20)
  const unread: Array<{ relativePath: string; absolutePath: string; content: string }> = []

  for (const file of files) {
    const content = await readText(file.absolutePath)
    if (/status:\s*"(unread|needs-reply)"/.test(content) || /status:\s*(unread|needs-reply)/.test(content)) {
      unread.push({ ...file, content })
    }
    if (unread.length >= limit) break
  }

  return unread
}

async function readSectionFiles(files: Array<{ relativePath: string; absolutePath: string }>) {
  const sections: string[] = []

  for (const file of files) {
    const content = await readText(file.absolutePath)
    if (!content) continue
    sections.push([`### ${file.relativePath}`, "", "```markdown", content, "```"].join("\n"))
  }

  return sections.join("\n\n") || "无可用内容。"
}

async function listWorkspaceProjects(cwd: string) {
  const projectsDir = path.resolve(cwd, "os/workspace/projects")
  let entries: fs.Dirent[]
  try {
    entries = await fs.promises.readdir(projectsDir, { withFileTypes: true })
  } catch {
    return "未找到 workspace projects。"
  }

  const projects = entries.filter((entry) => entry.isDirectory()).map((entry) => `- ${entry.name}`)
  return projects.length ? projects.join("\n") : "暂无 workspace project。"
}

async function buildStartupMessage(ctx: ExtensionContext) {
  const today = todayInShanghai()

  const todoFiles = (await listDatedMarkdownFiles(ctx.cwd, "os/todo"))
    .filter((file) => file.date <= today)
    .slice(-MAX_ITEMS_PER_SECTION)
    .reverse()

  const calendarFiles = (await listDatedMarkdownFiles(ctx.cwd, "os/calendar"))
    .filter((file) => file.date >= today)
    .slice(0, MAX_ITEMS_PER_SECTION)

  const inboxFiles = await unreadInboxFiles(ctx.cwd, MAX_ITEMS_PER_SECTION)
  const memorySummaryFiles = await latestFiles(ctx.cwd, "os/memory/summaries", 2)
  const projects = await listWorkspaceProjects(ctx.cwd)

  const extensionNames = (await pathExists(path.resolve(ctx.cwd, ".pi/extensions")))
    ? (await fs.promises.readdir(path.resolve(ctx.cwd, ".pi/extensions")))
        .filter((name) => name.endsWith(".ts") || name.endsWith(".js"))
        .sort()
        .map((name) => `- ${name}`)
        .join("\n")
    : "未找到 .pi/extensions。"

  return [
    "这是一次 Pi 启动后的系统简报请求。",
    "",
    "请你用中文给用户发送一条简洁但有用的启动简报。请基于下面读取到的 Agent OS 文件内容，概括：",
    "",
    "1. 当前系统是什么状态。",
    "2. 最近有哪些 todo，尤其是仍未完成或需要注意的事项。",
    "3. 接下来有哪些日程安排。",
    "4. 有没有未读或需要回复的 inbox。",
    "5. 当前 workspace 正在做什么。",
    "6. 有哪些自动化扩展正在工作。",
    "",
    "如果某个部分没有内容，请自然地说明暂无。不要更新文件；这次只给用户做启动介绍。",
    "",
    `当前日期: ${today} Asia/Shanghai`,
    "",
    "## Workspace Projects",
    "",
    projects,
    "",
    "## Pi Extensions",
    "",
    extensionNames || "暂无扩展。",
    "",
    "## Recent Todo Files",
    "",
    await readSectionFiles(todoFiles),
    "",
    "## Upcoming Calendar Files",
    "",
    await readSectionFiles(calendarFiles),
    "",
    "## Unread Or Needs-Reply Inbox",
    "",
    await readSectionFiles(inboxFiles),
    "",
    "## Recent Memory Summaries",
    "",
    await readSectionFiles(memorySummaryFiles),
  ].join("\n")
}

export default function startupSystemBriefingExtension(pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    if (isPrintMode()) return

    try {
      const osDir = path.resolve(ctx.cwd, "os")
      if (!(await pathExists(osDir))) {
        if (ctx.hasUI) ctx.ui.notify("未找到 os/，startup-system-briefing 未启用", "warning")
        return
      }

      const message = await buildStartupMessage(ctx)

      if (ctx.isIdle()) {
        pi.sendUserMessage(message)
      } else {
        pi.sendUserMessage(message, { deliverAs: "followUp" })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (ctx.hasUI) ctx.ui.notify(`启动简报生成失败: ${message}`, "error")
    }
  })
}

