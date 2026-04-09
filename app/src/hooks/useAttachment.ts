import { useCallback } from 'react'
import { processFile } from '../utils/fileProcessor'
import { detectKind } from '../types/attachment'
import { useAttachmentStore } from '../stores/attachmentStore'
import type { Attachment } from '../types/attachment'

function useAttachment() {
  const { addAttachment, updateAttachment, removeAttachment } = useAttachmentStore()

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)

      for (const file of fileArray) {
        const kind = detectKind(file)
        if (!kind) continue

        const attachment: Attachment = {
          id: crypto.randomUUID(),
          file,
          kind,
          status: 'processing',
          processedContent: null,
          previewUrl: null,
          errorMessage: null,
        }

        addAttachment(attachment)

        try {
          const { content, previewUrl } = await processFile(file, kind)
          updateAttachment(attachment.id, {
            status: 'ready',
            processedContent: content,
            previewUrl,
          })
        } catch (error) {
          updateAttachment(attachment.id, {
            status: 'error',
            errorMessage: error instanceof Error ? error.message : '処理に失敗しました',
          })
        }
      }
    },
    [addAttachment, updateAttachment],
  )

  return { addFiles, removeAttachment }
}

export { useAttachment }
