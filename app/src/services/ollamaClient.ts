import type { Message } from '../types/chat'
import type { InvocationContext, ModelDescriptor, ModelStatus } from '../types/model'
import type { InferenceClient } from './inferenceClient'

const OLLAMA_BASE = 'http://localhost:11434'

function toOllamaRole(role: Message['role']): string {
  return role === 'assistant' ? 'assistant' : role === 'system' ? 'system' : 'user'
}

export interface SendOptions {
  /** base64-encoded images to attach to the last user message */
  images?: string[]
}

class OllamaClient implements InferenceClient {
  private abortController: AbortController | null = null

  async *sendMessage(
    messages: Message[],
    context: InvocationContext,
    options: SendOptions = {},
  ): AsyncGenerator<string> {
    this.abortController = new AbortController()

    const ollamaMessages = messages.map((m, i) => {
      const base: Record<string, unknown> = {
        role: toOllamaRole(m.role),
        content: m.content,
      }
      // Attach images to the last user message
      if (
        options.images?.length &&
        i === messages.length - 1 &&
        m.role === 'user'
      ) {
        base.images = options.images
      }
      return base
    })

    const body = JSON.stringify({
      model: 'gemma4:e2b',
      messages: ollamaMessages,
      stream: context.stream,
      options: {
        num_ctx: context.contextLimit,
      },
    })

    let response: Response
    try {
      response = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: this.abortController.signal,
      })
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      throw new Error('Ollama に接続できません。ollama serve が起動しているか確認してください。')
    }

    if (!response.ok) {
      throw new Error(`Ollama エラー: ${response.status} ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value, { stream: true }).split('\n')
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const data = JSON.parse(line)
            const content = data?.message?.content
            if (content) yield content
            if (data?.done) return
          } catch {
            // partial JSON line — skip
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async getModelStatus(modelId: string): Promise<ModelStatus> {
    try {
      const response = await fetch(`${OLLAMA_BASE}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      })
      if (!response.ok) return 'error'
      const data = await response.json()
      const models: Array<{ name: string }> = data.models ?? []
      const found = models.some(
        (m) => m.name === modelId || m.name.startsWith(modelId.split(':')[0]),
      )
      return found ? 'ready' : 'not-installed'
    } catch {
      return 'error'
    }
  }

  async getAvailableModels(): Promise<ModelDescriptor[]> {
    try {
      const response = await fetch(`${OLLAMA_BASE}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      })
      if (!response.ok) return []
      const data = await response.json()
      return (data.models ?? []).map((m: { name: string }) => ({
        id: m.name,
        name: m.name,
        supportsText: true,
        supportsImage: false,
        supportsStreaming: true,
        minMemoryGb: 4,
        recommendedMemoryGb: 8,
        cpuOnlySupported: true,
        requiresMmproj: false,
      }))
    } catch {
      return []
    }
  }

  abortGeneration(): void {
    this.abortController?.abort()
    this.abortController = null
  }
}

const ollamaClient = new OllamaClient()
export { ollamaClient }
