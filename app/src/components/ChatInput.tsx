import { useState, useRef, useCallback } from 'react'
import { useChat } from '../hooks/useChat'
import { useAttachment } from '../hooks/useAttachment'
import { useChatStore } from '../stores/chatStore'
import { useModelStore } from '../stores/modelStore'
import { useAttachmentStore } from '../stores/attachmentStore'
import { AttachmentPreview } from './AttachmentPreview'
import { WebcamModal } from './WebcamModal'

function ChatInput() {
  const [value, setValue] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { sendMessage, stopGeneration } = useChat()
  const { addFiles } = useAttachment()
  const { isGenerating, error } = useChatStore()
  const status = useModelStore((s) => s.status)
  const attachments = useAttachmentStore((s) => s.attachments)

  const hasProcessingAttachments = attachments.some((a) => a.status === 'processing')
  const canSend =
    !isGenerating &&
    !hasProcessingAttachments &&
    status === 'ready' &&
    (value.trim().length > 0 || attachments.some((a) => a.status === 'ready'))

  const handleSubmit = useCallback(async () => {
    if (!canSend) return
    const content = value.trim()
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(content)
  }, [value, canSend, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files)
        e.target.value = ''
      }
    },
    [addFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles],
  )

  const placeholder = isDragging
    ? 'ファイルをドロップ…'
    : status !== 'ready'
      ? 'モデルの準備ができていません…'
      : hasProcessingAttachments
        ? 'ファイルを処理中…'
        : 'メッセージを入力'

  return (
    <>
      {showCamera && <WebcamModal onClose={() => setShowCamera(false)} />}

      <div
        className={`border-t border-gray-200 bg-white transition-colors ${isDragging ? 'bg-blue-50 border-blue-300' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="text-center text-sm text-blue-500 py-2">
            ファイルをドロップして添付
          </div>
        )}

        <AttachmentPreview />

        {error && (
          <div className="mx-4 mt-2 px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 pt-1">
          <p className="text-xs text-gray-400">Shift+Enter で送信　Enter で改行</p>
        </div>

        <div className="flex items-end gap-1.5 max-w-2xl mx-auto p-4">
          {/* File attachment */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
            title="ファイルを添付（画像・テキスト・PDF）"
            className="flex-shrink-0 p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-40 rounded-xl transition-colors"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.heic,.heif,.txt,.md,.csv,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Camera */}
          <button
            onClick={() => setShowCamera(true)}
            disabled={isGenerating}
            title="カメラで撮影"
            className="flex-shrink-0 p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-40 rounded-xl transition-colors"
          >
            📷
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isGenerating || status !== 'ready'}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400 max-h-40 overflow-y-auto"
          />

          {isGenerating ? (
            <button
              onClick={stopGeneration}
              className="flex-shrink-0 px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              停止
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSend}
              className="flex-shrink-0 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl transition-colors"
            >
              送信
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export { ChatInput }
