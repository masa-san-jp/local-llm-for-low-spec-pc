import heic2any from 'heic2any'
import * as pdfjsLib from 'pdfjs-dist'
// `?url` tells Vite to emit the file as a static asset and return its URL.
// This is more reliable than `new URL(..., import.meta.url)` for files in
// node_modules, especially when pdfjs-dist is excluded from pre-bundling.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { Attachment, AttachmentKind } from '../types/attachment'
import { isHeic } from '../types/attachment'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

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

/**
 * Read a file as text, detecting encoding automatically.
 * Tries UTF-8 first; falls back to Shift-JIS when the result contains
 * the Unicode replacement character (U+FFFD), which indicates a mismatch.
 */
async function fileToText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const tryDecode = (encoding: string): string => new TextDecoder(encoding).decode(buffer)
  const countReplacementChars = (text: string): number => (text.match(/\uFFFD/g) ?? []).length

  const utf8 = tryDecode('utf-8')
  // If UTF-8 decoding produced replacement characters, try Shift-JIS (common for Japanese CSV)
  if (utf8.includes('\uFFFD')) {
    try {
      const sjis = tryDecode('shift-jis')
      // Prefer Shift-JIS only when it produces fewer replacement characters
      if (countReplacementChars(sjis) < countReplacementChars(utf8)) {
        return sjis
      }
    } catch {
      // TextDecoder may not support shift-jis in all environments; fall back to UTF-8
    }
  }
  return utf8
}

/** Minimum number of extracted characters to consider a PDF readable (not a scan-only PDF) */
const MIN_PDF_TEXT_LENGTH = 10

async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({
    data: buffer,
    // Required for PDFs that use CJK (Japanese/Chinese/Korean) character maps
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    // Embedded font fallback data
    standardFontDataUrl: '/standard_fonts/',
  })
  const pdf = await loadingTask.promise

  const pageTexts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s{3,}/g, '\n')
      .trim()
    if (pageText) pageTexts.push(pageText)
  }

  const result = pageTexts.join('\n\n').trim()
  if (result.length < MIN_PDF_TEXT_LENGTH) {
    throw new Error(
      'このPDFからテキストを抽出できませんでした。スキャンPDFはサポートされていません。',
    )
  }
  return result.slice(0, 8000) // limit to avoid context overflow
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
