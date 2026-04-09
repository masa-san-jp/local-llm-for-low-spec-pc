import heic2any from 'heic2any'
import type { Attachment, AttachmentKind } from '../types/attachment'
import { isHeic } from '../types/attachment'

async function fileToBase64(file: File): Promise<string> {
  let target: File | Blob = file

  // Convert HEIC/HEIF to JPEG before encoding
  if (isHeic(file)) {
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
    target = Array.isArray(converted) ? converted[0] : converted
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip data URL prefix (e.g. "data:image/jpeg;base64,")
      resolve(result.split(',')[1])
    }
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
    reader.readAsDataURL(target)
  })
}

async function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('テキストファイルの読み込みに失敗しました'))
    reader.readAsText(file, 'utf-8')
  })
}

async function extractPdfText(file: File): Promise<string> {
  // Basic PDF text extraction: read as text and strip binary noise
  // For a proper implementation, pdfjsLib can be added later
  const text = await fileToText(file)
  // Extract readable ASCII text from PDF
  const readable = text
    .replace(/[^\x20-\x7e\n\r\t\u3000-\u9fff\uff00-\uffef]/g, ' ')
    .replace(/\s{3,}/g, '\n')
    .trim()
  if (readable.length < 50) {
    throw new Error(
      'このPDFからテキストを抽出できませんでした。スキャンPDFはサポートされていません。',
    )
  }
  return readable.slice(0, 8000) // limit to avoid context overflow
}

async function processFile(
  file: File,
  kind: AttachmentKind,
): Promise<{ content: string; previewUrl: string | null }> {
  switch (kind) {
    case 'image': {
      // For HEIC, convert to JPEG first so the preview also renders correctly
      let previewSource: Blob = file
      if (isHeic(file)) {
        const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
        previewSource = Array.isArray(converted) ? converted[0] : converted
      }
      const base64 = await fileToBase64(file)
      const previewUrl = URL.createObjectURL(previewSource)
      return { content: base64, previewUrl }
    }
    case 'text': {
      const content = await fileToText(file)
      return { content: content.slice(0, 8000), previewUrl: null }
    }
    case 'pdf': {
      const content = await extractPdfText(file)
      return { content, previewUrl: null }
    }
  }
}

function buildAttachmentContext(attachments: Attachment[]): {
  textContext: string
  imageBase64List: string[]
} {
  const imageBase64List: string[] = []
  const textParts: string[] = []

  for (const att of attachments) {
    if (!att.processedContent || att.status !== 'ready') continue
    if (att.kind === 'image') {
      imageBase64List.push(att.processedContent)
    } else {
      textParts.push(`--- 添付ファイル: ${att.file.name} ---\n${att.processedContent}`)
    }
  }

  return {
    textContext: textParts.join('\n\n'),
    imageBase64List,
  }
}

export { processFile, buildAttachmentContext }
