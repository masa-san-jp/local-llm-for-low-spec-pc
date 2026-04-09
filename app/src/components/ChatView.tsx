import { useEffect, useRef } from 'react'
import { useChatStore } from '../stores/chatStore'
import { MessageBubble } from './MessageBubble'
import { SpecTable } from './SpecTable'

function ChatView() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { isGenerating, streamingContent, getActiveSession } = useChatStore()
  const session = getActiveSession()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages.length, streamingContent])

  if (!session || session.messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">local-llm へようこそ</h1>
          <p className="text-gray-500 mb-6 text-sm">
            低スペックPCで動くローカルLLMチャットアプリです。メッセージを入力して会話を始めましょう。
          </p>
          <SpecTable />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="max-w-2xl mx-auto">
        {session.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isGenerating && streamingContent && (
          <MessageBubble
            message={{
              id: '__streaming__',
              role: 'assistant',
              content: streamingContent,
              timestamp: Date.now(),
              tokenCount: 0,
            }}
            isStreaming
          />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export { ChatView }
