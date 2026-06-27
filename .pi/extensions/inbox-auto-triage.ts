import * as fs from "node:fs"
import * as path from "node:path"
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent"
import { DEFAULT_MAX_LINES, truncateHead } from "@earendil-works/pi-coding-agent"

const INBOX_DIR = "os/inbox"
const DEBOUNCE_MS = 1000
const MAX_MAIL_BYTES = 24 * 1024

type InboxMail = {
  relativePath: string
  absolutePath: string
  content: string
}

async function collectMarkdownFiles(root: string): Promise<Set<string>> {
  const files = new Set<string>()

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
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.add(abs)
      }
    }
  }

  await walk(root)
  return files
}

async function readMail(cwd: string, absolutePath: string): Promise<InboxMail | undefined> {
  try {
    const stat = await fs.promises.stat(absolutePath)
    if (!stat.isFile()) return undefined
    if (!absolutePath.endsWith(".md")) return undefined

    const raw = await fs.promises.readFile(absolutePath, "utf8")
    const truncation = truncateHead(raw, {
      maxBytes: MAX_MAIL_BYTES,
      maxLines: DEFAULT_MAX_LINES,
    })

    let content = truncation.content
    if (truncation.truncated) {
      content += `\n\n[邮件内容已截断: ${truncation.outputLines}/${truncation.totalLines} 行]`
    }

    return {
      absolutePath,
      relativePath: path.relative(cwd, absolutePath),
      content,
    }
  } catch {
    return undefined
  }
}

function buildTriageMessage(mail: InboxMail) {
  return [
    "检测到 inbox 中有一封新邮件到达。",
    "",
    "请你阅读下面这封邮件，并基于当前项目的 Agent OS 文件结构判断是否需要行动：",
    "",
    "1. 如果邮件里包含明确的待办事项、请求、阻塞或跟进动作，请更新 `os/todo/` 下合适日期的 todo 文件。",
    "2. 如果邮件里包含会议、时间窗口、截止时间、提醒或日程安排，请更新 `os/calendar/` 下合适日期的 calendar 文件。",
    "3. 如果邮件里包含值得长期保留的项目事实、规则、素材线索或决策，请按需更新 `os/wiki/` 或 `os/memory/`。",
    "4. 如果不需要更新任何文件，请只回复 `<|no_change|>`。",
    "5. 请避免重复处理同一封邮件；如果相关 todo/calendar 已经存在，只在必要时补充缺失信息。",
    "",
    `新邮件路径: \`${mail.relativePath}\``,
    "",
    "```markdown",
    mail.content,
    "```",
  ].join("\n")
}

export default function inboxAutoTriageExtension(pi: ExtensionAPI) {
  let watcher: fs.FSWatcher | undefined
  let inboxAbs = ""
  let seenFiles = new Set<string>()
  let pendingFiles = new Set<string>()
  let debounceTimer: NodeJS.Timeout | undefined
  let processing = false
  let rerunRequested = false

  const queueMailForPi = (ctx: ExtensionContext, mail: InboxMail) => {
    const message = buildTriageMessage(mail)

    if (ctx.isIdle()) {
      pi.sendUserMessage(message)
      return
    }

    pi.sendUserMessage(message, { deliverAs: "followUp" })
  }

  const scanForNewMail = async () => {
    if (!inboxAbs) return

    const currentFiles = await collectMarkdownFiles(inboxAbs)
    for (const file of currentFiles) {
      if (!seenFiles.has(file)) pendingFiles.add(file)
    }
  }

  const processPendingMail = async (ctx: ExtensionContext) => {
    if (processing) {
      rerunRequested = true
      return
    }

    processing = true

    try {
      await scanForNewMail()

      const batch = Array.from(pendingFiles).sort()
      pendingFiles.clear()

      for (const file of batch) {
        if (seenFiles.has(file)) continue

        const mail = await readMail(ctx.cwd, file)
        seenFiles.add(file)

        if (mail) queueMailForPi(ctx, mail)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (ctx.hasUI) ctx.ui.notify(`inbox 自动分拣异常: ${message}`, "error")
    } finally {
      processing = false

      if (rerunRequested) {
        rerunRequested = false
        void processPendingMail(ctx)
      }
    }
  }

  pi.on("session_start", async (_event, ctx) => {
    inboxAbs = path.resolve(ctx.cwd, INBOX_DIR)

    try {
      const stat = await fs.promises.stat(inboxAbs)
      if (!stat.isDirectory()) {
        if (ctx.hasUI) ctx.ui.notify(`${INBOX_DIR} 不是目录，inbox-auto-triage 未启用`, "warning")
        return
      }
    } catch {
      if (ctx.hasUI) ctx.ui.notify(`未找到 ${INBOX_DIR}，inbox-auto-triage 未启用`, "warning")
      return
    }

    seenFiles = await collectMarkdownFiles(inboxAbs)
    pendingFiles.clear()

    watcher = fs.watch(inboxAbs, { recursive: true }, (_eventType, filename) => {
      if (filename && !String(filename).endsWith(".md")) return

      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        void processPendingMail(ctx)
      }, DEBOUNCE_MS)
    })

    watcher.on("error", (error) => {
      if (ctx.hasUI) ctx.ui.notify(`inbox watcher 监听失败: ${error.message}`, "error")
    })

    if (ctx.hasUI) {
      ctx.ui.notify(`已监听新邮件: ${INBOX_DIR} (${seenFiles.size} 封 baseline)`, "info")
    }
  })

  pi.on("session_shutdown", async () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = undefined

    if (watcher) watcher.close()
    watcher = undefined

    inboxAbs = ""
    seenFiles.clear()
    pendingFiles.clear()
  })
}

