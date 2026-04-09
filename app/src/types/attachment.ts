export type AttachmentKind = 'image' | 'text' | 'pdf'

export type AttachmentStatus = 'pending' | 'processing' | 'ready' | 'error'

export interface Attachment {
  id: string
  file: File
  kind: AttachmentKind
  status: AttachmentStatus
  /** base64 for images, extracted text for text/pdf */
  processedContent: string | null
  previewUrl: string | null
  errorMessage: string | null
}

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]
export const SUPPORTED_TEXT_TYPES = ['text/plain', 'text/markdown', 'text/csv']
export const SUPPORTED_PDF_TYPES = ['application/pdf']

function isHeic(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    ext === 'heic' ||
    ext === 'heif'
  )
}

export function detectKind(file: File): AttachmentKind | null {
  if (SUPPORTED_IMAGE_TYPES.includes(file.type) || isHeic(file)) return 'image'
  if (SUPPORTED_TEXT_TYPES.includes(file.type) || file.name.endsWith('.md')) return 'text'
  if (SUPPORTED_PDF_TYPES.includes(file.type)) return 'pdf'
  return null
}

export { isHeic }
