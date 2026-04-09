import { useAttachmentStore } from '../stores/attachmentStore'
import { useAttachment } from '../hooks/useAttachment'

const KIND_ICON: Record<string, string> = {
  image: '🖼',
  text: '📄',
  pdf: '📕',
}

function AttachmentPreview() {
  const attachments = useAttachmentStore((s) => s.attachments)
  const { removeAttachment } = useAttachment()

  if (attachments.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-4 pt-2 max-w-2xl mx-auto">
      {attachments.map((att) => (
        <div
          key={att.id}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
            att.status === 'error'
              ? 'border-red-300 bg-red-50 text-red-600'
              : att.status === 'processing'
                ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 bg-gray-50 text-gray-700'
          }`}
        >
          {att.kind === 'image' && att.previewUrl ? (
            <img
              src={att.previewUrl}
              alt={att.file.name}
              className="w-8 h-8 object-cover rounded"
            />
          ) : (
            <span>{KIND_ICON[att.kind] ?? '📎'}</span>
          )}
          <span className="max-w-[120px] truncate">{att.file.name}</span>
          {att.status === 'processing' && (
            <span className="text-yellow-500 animate-pulse">処理中…</span>
          )}
          {att.status === 'error' && (
            <span title={att.errorMessage ?? ''}>⚠</span>
          )}
          <button
            onClick={() => removeAttachment(att.id)}
            className="ml-1 text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export { AttachmentPreview }
