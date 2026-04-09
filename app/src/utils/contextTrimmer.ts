import type { Message } from '../types/chat'
import { estimateSessionTokens } from './tokenEstimator'

interface TrimResult {
  trimmed: Message[]
  removedCount: number
}

function trimMessages(messages: Message[], maxTokens: number): TrimResult {
  const total = estimateSessionTokens(messages)
  if (total <= maxTokens) {
    return { trimmed: messages, removedCount: 0 }
  }

  // Keep system messages and always preserve at least the last exchange
  const systemMessages = messages.filter((m) => m.role === 'system')
  const nonSystem = messages.filter((m) => m.role !== 'system')

  // Must keep at least the last user + last assistant messages
  const mustKeep = nonSystem.slice(-2)
  const candidates = nonSystem.slice(0, -2)

  const kept: Message[] = []
  let runningTokens = estimateSessionTokens([...systemMessages, ...mustKeep])

  // Add back from newest to oldest until limit reached
  for (let i = candidates.length - 1; i >= 0; i--) {
    const msg = candidates[i]
    if (runningTokens + msg.tokenCount <= maxTokens) {
      kept.unshift(msg)
      runningTokens += msg.tokenCount
    }
  }

  const trimmed = [...systemMessages, ...kept, ...mustKeep]
  return { trimmed, removedCount: messages.length - trimmed.length }
}

export { trimMessages }
export type { TrimResult }
