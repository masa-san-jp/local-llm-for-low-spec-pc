import { writeTextFile, mkdir } from '@tauri-apps/plugin-fs'
import { appDataDir, join } from '@tauri-apps/api/path'
import type { Session } from '../types/chat'

function formatDate(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 50)
}

function generateMarkdown(session: Session): string {
  const date = new Date(session.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const lines: string[] = [
    `# ${session.title}`,
    '',
    `日時: ${date}`,
    `モデル: ${session.modelId}`,
    '',
    '---',
    '',
  ]

  for (const msg of session.messages) {
    const role = msg.role === 'user' ? '**ユーザー**' : `**${session.modelId}**`
    lines.push(`### ${role}`)
    lines.push('')
    lines.push(msg.content)
    lines.push('')
  }

  return lines.join('\n')
}

async function archiveSession(session: Session): Promise<string> {
  const markdown = generateMarkdown(session)
  const dataDir = await appDataDir()
  const logDir = await join(dataDir, 'log')

  await mkdir(logDir, { recursive: true })

  const fileDatePrefix = formatDate(session.updatedAt)
  const safeName = sanitizeFilename(session.title)
  const filename = `${fileDatePrefix}_${safeName}.md`
  const filePath = await join(logDir, filename)

  await writeTextFile(filePath, markdown)

  return filePath
}

export { archiveSession }
