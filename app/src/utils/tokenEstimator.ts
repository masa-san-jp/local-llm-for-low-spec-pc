import type { Message } from '../types/chat'

// Rough heuristic: ~4 chars per token for ASCII, ~1.5 chars per token for CJK
function estimateTokens(text: string): number {
  const cjkCount = (text.match(/[\u3000-\u9fff\uff00-\uffef]/g) ?? []).length
  const asciiCount = text.length - cjkCount
  return Math.ceil(asciiCount / 4 + cjkCount / 1.5)
}

function estimateSessionTokens(messages: Message[]): number {
  return messages.reduce((sum, m) => sum + m.tokenCount, 0)
}

export { estimateTokens, estimateSessionTokens }
