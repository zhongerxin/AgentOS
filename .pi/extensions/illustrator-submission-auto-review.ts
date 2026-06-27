import * as fs from "node:fs"
import * as path from "node:path"
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent"
import { DEFAULT_MAX_LINES, truncateHead } from "@earendil-works/pi-coding-agent"

const PLATFORM_DIR = "os/collaboration/illustrator-outsourcing-platform"
const TASKS_DIR = "tasks"
const SUBMISSIONS_DIR = "submissions"
const DEBOUNCE_MS = 1200
const MAX_TEXT_BYTES = 32 * 1024

type SubmissionFile = {
  absolutePath: string
  relativePath: string
  taskId: string
  taskPath: string
  submissionPath: string
}

type SubmissionBatch = {
  taskId: string
  taskPath: string
  submissionPath: string
  files: SubmissionFile[]
}

async function collectSubmissionFiles(platformRoot: string, cwd: string): Promise<Map<string, SubmissionFile>> {
  const files = new Map<string, SubmissionFile>()

  async function walk(dir: string) {
    let entries: fs.Dirent[]
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry.name === ".DS_Store") continue

      const abs = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(abs)
        continue
      }

      if (!entry.isFile() || entry.name === ".gitkeep") continue

      const submissionFile = getSubmissionFile(platformRoot, cwd, abs)
      if (submissionFile) files.set(abs, submissionFile)
    }
  }

  await walk(path.join(platformRoot, TASKS_DIR))
  return files
}

function getSubmissionFile(platformRoot: string, cwd: string, absolutePath: string): SubmissionFile | undefined {
  const relativeToPlatform = path.relative(platformRoot, absolutePath)
  const parts = relativeToPlatform.split(path.sep)

  const tasksIndex = parts.indexOf(TASKS_DIR)
  const submissionsIndex = parts.indexOf(SUBMISSIONS_DIR)

  if (tasksIndex !== 0) return undefined
  if (submissionsIndex !== 2) return undefined

  const taskId = parts[1]
  if (!taskId) return undefined

  const submissionEnd = parts.length > submissionsIndex + 2 ? submissionsIndex + 2 : submissionsIndex + 1
  const submissionParts = parts.slice(0, submissionEnd)
  const submissionPath = submissionParts.join(path.sep)

  return {
    absolutePath,
    relativePath: path.relative(cwd, absolutePath),
    taskId,
    taskPath: path.join(PLATFORM_DIR, TASKS_DIR, taskId),
    submissionPath: path.join(PLATFORM_DIR, submissionPath),
  }
}

async function readTextIfExists(filePath: string): Promise<string> {
  try {
    const raw = await fs.promises.readFile(filePath, "utf8")
    const truncation = truncateHead(raw, {
      maxBytes: MAX_TEXT_BYTES,
      maxLines: DEFAULT_MAX_LINES,
    })

    let content = truncation.content
    if (truncation.truncated) {
      content += `\n\n[内容已截断: ${truncation.outputLines}/${truncation.totalLines} 行]`
    }
    return content
  } catch {
    return ""
  }
}

async function findDeliveryNotes(submissionAbs: string, cwd: string): Promise<Array<{ relativePath: string; content: string }>> {
  const notes: Array<{ relativePath: string; content: string }> = []

  async function walk(dir: string) {
    let entries: fs.Dirent[]
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const abs = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(abs)
      } else if (entry.isFile() && entry.name.toLowerCase() === "delivery-note.md") {
        notes.push({
          relativePath: path.relative(cwd, abs),
          content: await readTextIfExists(abs),
        })
      }
    }
  }

  await walk(submissionAbs)
  return notes
}

function groupSubmissionFiles(files: SubmissionFile[]): SubmissionBatch[] {
  const batches = new Map<string, SubmissionBatch>()

  for (const file of files) {
    const key = `${file.taskId}\0${file.submissionPath}`
    const existing = batches.get(key)
    if (existing) {
      existing.files.push(file)
    } else {
      batches.set(key, {
        taskId: file.taskId,
        taskPath: file.taskPath,
        submissionPath: file.submissionPath,
        files: [file],
      })
    }
  }

  return Array.from(batches.values()).sort((a, b) => a.submissionPath.localeCompare(b.submissionPath))
}

async function buildReviewMessage(ctx: ExtensionContext, platformAbs: string, batch: SubmissionBatch) {
  const taskMdRel = path.join(batch.taskPath, "task.md")
  const taskMdAbs = path.resolve(ctx.cwd, taskMdRel)
  const taskContent = await readTextIfExists(taskMdAbs)

  const submissionAbs = path.resolve(ctx.cwd, batch.submissionPath)
  const deliveryNotes = await findDeliveryNotes(submissionAbs, ctx.cwd)

  const fileLines = batch.files
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
    .map((file) => `- \`${file.relativePath}\``)
    .join("\n")

  const deliveryNoteSections = deliveryNotes.length
    ? deliveryNotes
        .map((note) => [`### ${note.relativePath}`, "", "```markdown", note.content, "```"].join("\n"))
        .join("\n\n")
    : "未找到 `delivery-note.md`。请在验收时把这一点作为风险或补充要求。"

  return [
    "检测到插画师外包平台中有新的作品提交。",
    "",
    "请你根据对应任务要求自动评估这次提交是否达标，并在需要时直接行动：",
    "",
    "1. 阅读任务要求和新增作品路径。",
    "2. 如果有图片或设计文件，请使用可用工具查看文件；不要只凭文件名验收。",
    "3. 判断作品是否满足 `task.md` 的交付物、视觉方向、技术要求、截止时间和验收标准。",
    "4. 如果达标，请把可用作品复制或整理到 `os/workspace/projects/texas-holdem-chatgpt-app/assets/`，并更新相关 workspace notes。",
    "5. 如果达标，请更新 `os/todo/`：补充 UI 集成、资产接入或后续检查任务。",
    "6. 如果不达标，请在任务的 `owner-notes.md` 里写清楚修改意见，并按需更新 todo。",
    "7. 如有长期信息或决策，请按需更新 `os/memory/` 或 `os/wiki/`。",
    "8. 如果这次变更不需要任何动作，或者是你上一次操作产生的重复事件，请回复 `<|no_change|>`。",
    "",
    `平台目录: \`${path.relative(ctx.cwd, platformAbs)}\``,
    `任务目录: \`${batch.taskPath}\``,
    `提交目录: \`${batch.submissionPath}\``,
    "",
    "## 新增文件",
    "",
    fileLines || "- 无",
    "",
    "## 任务要求 task.md",
    "",
    "```markdown",
    taskContent || `[未能读取 ${taskMdRel}]`,
    "```",
    "",
    "## Delivery Notes",
    "",
    deliveryNoteSections,
  ].join("\n")
}

export default function illustratorSubmissionAutoReviewExtension(pi: ExtensionAPI) {
  let watcher: fs.FSWatcher | undefined
  let platformAbs = ""
  let seenFiles = new Set<string>()
  let pendingFiles = new Map<string, SubmissionFile>()
  let debounceTimer: NodeJS.Timeout | undefined
  let processing = false
  let rerunRequested = false

  const sendReviewRequest = async (ctx: ExtensionContext, batch: SubmissionBatch) => {
    const message = await buildReviewMessage(ctx, platformAbs, batch)

    if (ctx.isIdle()) {
      pi.sendUserMessage(message)
      return
    }

    pi.sendUserMessage(message, { deliverAs: "followUp" })
  }

  const scanForNewSubmissions = async (ctx: ExtensionContext) => {
    const current = await collectSubmissionFiles(platformAbs, ctx.cwd)

    for (const [abs, file] of current) {
      if (!seenFiles.has(abs)) pendingFiles.set(abs, file)
    }
  }

  const processPendingSubmissions = async (ctx: ExtensionContext) => {
    if (processing) {
      rerunRequested = true
      return
    }

    processing = true

    try {
      await scanForNewSubmissions(ctx)

      const batchFiles = Array.from(pendingFiles.values()).sort((a, b) => a.relativePath.localeCompare(b.relativePath))
      pendingFiles.clear()

      for (const file of batchFiles) seenFiles.add(file.absolutePath)

      for (const batch of groupSubmissionFiles(batchFiles)) {
        await sendReviewRequest(ctx, batch)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (ctx.hasUI) ctx.ui.notify(`插画提交自动评审异常: ${message}`, "error")
    } finally {
      processing = false

      if (rerunRequested) {
        rerunRequested = false
        void processPendingSubmissions(ctx)
      }
    }
  }

  pi.on("session_start", async (_event, ctx) => {
    platformAbs = path.resolve(ctx.cwd, PLATFORM_DIR)

    try {
      const stat = await fs.promises.stat(platformAbs)
      if (!stat.isDirectory()) {
        if (ctx.hasUI) ctx.ui.notify(`${PLATFORM_DIR} 不是目录，illustrator-submission-auto-review 未启用`, "warning")
        return
      }
    } catch {
      if (ctx.hasUI) ctx.ui.notify(`未找到 ${PLATFORM_DIR}，illustrator-submission-auto-review 未启用`, "warning")
      return
    }

    seenFiles = new Set((await collectSubmissionFiles(platformAbs, ctx.cwd)).keys())
    pendingFiles.clear()

    watcher = fs.watch(platformAbs, { recursive: true }, (_eventType, filename) => {
      const normalized = filename ? String(filename) : ""
      if (normalized && !normalized.includes(`${path.sep}${SUBMISSIONS_DIR}${path.sep}`) && !normalized.includes(`/${SUBMISSIONS_DIR}/`)) {
        return
      }

      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        void processPendingSubmissions(ctx)
      }, DEBOUNCE_MS)
    })

    watcher.on("error", (error) => {
      if (ctx.hasUI) ctx.ui.notify(`插画平台 watcher 监听失败: ${error.message}`, "error")
    })

    if (ctx.hasUI) {
      ctx.ui.notify(`已监听插画作品提交: ${PLATFORM_DIR} (${seenFiles.size} 个 baseline 文件)`, "info")
    }
  })

  pi.on("session_shutdown", async () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = undefined

    if (watcher) watcher.close()
    watcher = undefined

    platformAbs = ""
    seenFiles.clear()
    pendingFiles.clear()
  })
}
