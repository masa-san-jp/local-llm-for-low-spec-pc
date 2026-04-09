import { useCallback } from 'react'
import { ollamaClient } from '../services/ollamaClient'
import { saveSession, deleteSession as deleteFromStorage } from '../services/sessionStorage'
import { trimMessages } from '../utils/contextTrimmer'
import { estimateTokens } from '../utils/tokenEstimator'
import { buildAttachmentContext } from '../utils/fileProcessor'
import { useChatStore } from '../stores/chatStore'
import { useModelStore } from '../stores/modelStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useAttachmentStore } from '../stores/attachmentStore'
import type { Message } from '../types/chat'

function useChat() {
  const {
    addMessage,
    appendStreamingContent,
    clearStreamingContent,
    setGenerating,
    setError,
    createSession,
    deleteSession,
    getActiveSession,
    setActiveSession,
    updateSessionTitle,
  } = useChatStore()

  const { status, contextLimit } = useModelStore()
  const { defaultModel, performanceMode } = useSettingsStore()
  const { attachments, clearAttachments } = useAttachmentStore()

  const sendMessage = useCallback(
    async (content: string) => {
      if (status !== 'ready') {
        setError('モデルが準備できていません。Ollama が起動しているか確認してください。')
        return
      }

      let session = getActiveSession()
      if (!session) {
        session = createSession(defaultModel, contextLimit)
      }

      // Collect attachment context
      const { textContext, imageBase64List } = buildAttachmentContext(attachments)

      // Build stable data URLs for display in the message bubble
      const imagePreviews = attachments
        .filter((a) => a.kind === 'image' && a.processedContent && a.status === 'ready')
        .map((a) => `data:image/jpeg;base64,${a.processedContent}`)

      // Merge text attachments into user message content
      const fullContent = textContext
        ? `${content}\n\n${textContext}`
        : content

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: fullContent,
        timestamp: Date.now(),
        tokenCount: estimateTokens(fullContent),
        imagePreviews: imagePreviews.length > 0 ? imagePreviews : undefined,
      }

      addMessage(session.id, userMessage)
      clearAttachments()
      setGenerating(true)
      setError(null)
      clearStreamingContent()

      try {
        const currentSession = getActiveSession()!
        const { trimmed } = trimMessages([...currentSession.messages], contextLimit)

        const context = {
          role: 'chat' as const,
          contextLimit,
          stream: true,
          performanceMode,
        }

        let fullResponse = ''
        for await (const chunk of ollamaClient.sendMessage(trimmed, context, {
          images: imageBase64List.length > 0 ? imageBase64List : undefined,
        })) {
          fullResponse += chunk
          appendStreamingContent(chunk)
        }

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
          tokenCount: estimateTokens(fullResponse),
        }

        addMessage(session.id, assistantMessage)

        // Auto-title after first exchange
        const latestSession = getActiveSession()!
        if (latestSession.messages.length === 2) {
          const titleText = content.slice(0, 60)
          updateSessionTitle(
            session.id,
            titleText.length < content.length ? `${titleText}…` : titleText,
          )
        }

        await saveSession(getActiveSession()!)
      } catch (error) {
        const message = error instanceof Error ? error.message : '不明なエラーが発生しました'
        setError(message)
      } finally {
        setGenerating(false)
        clearStreamingContent()
      }
    },
    [
      status,
      contextLimit,
      defaultModel,
      performanceMode,
      attachments,
      getActiveSession,
      createSession,
      addMessage,
      appendStreamingContent,
      clearStreamingContent,
      clearAttachments,
      setGenerating,
      setError,
      updateSessionTitle,
    ],
  )

  const stopGeneration = useCallback(() => {
    ollamaClient.abortGeneration()
    setGenerating(false)
    clearStreamingContent()
  }, [setGenerating, clearStreamingContent])

  const startNewSession = useCallback(() => {
    return createSession(defaultModel, contextLimit)
  }, [createSession, defaultModel, contextLimit])

  const removeSession = useCallback(
    async (id: string) => {
      deleteSession(id)
      await deleteFromStorage(id)
    },
    [deleteSession],
  )

  return { sendMessage, stopGeneration, startNewSession, removeSession, setActiveSession }
}

export { useChat }
