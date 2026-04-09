import ReactMarkdown from 'react-markdown'
import type { Message } from '../types/chat'

interface Props {
  message: Message
  isStreaming?: boolean
}

function MessageBubble({ message, isStreaming = false }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        {isUser ? (
          <div>
            {message.imagePreviews && message.imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {message.imagePreviews.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`添付画像 ${i + 1}`}
                    className="max-h-40 max-w-[200px] rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
            {message.content && (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:bg-gray-800 prose-pre:text-gray-100">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-gray-500 ml-0.5 animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export { MessageBubble }
