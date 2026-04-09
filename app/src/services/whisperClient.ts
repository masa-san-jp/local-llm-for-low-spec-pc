import { Command } from '@tauri-apps/plugin-shell'
import { writeFile, remove } from '@tauri-apps/plugin-fs'
import { tempDir, join, appDataDir } from '@tauri-apps/api/path'

const WHISPER_BIN = '/opt/homebrew/bin/whisper-cpp'
const FFMPEG_BIN = '/opt/homebrew/bin/ffmpeg'

async function getModelPath(): Promise<string> {
  const dataDir = await appDataDir()
  return await join(dataDir, 'whisper', 'ggml-base.bin')
}

/** Check if whisper-cpp binary and model are available */
async function checkWhisperAvailable(): Promise<boolean> {
  try {
    const output = await Command.create(WHISPER_BIN, ['--help']).execute()
    const ok = output.code === 0 || (output.stderr ?? '').includes('usage')
    if (!ok) return false

    const modelPath = await getModelPath()
    const check = await Command.create(WHISPER_BIN, ['--model', modelPath, '--help']).execute()
    return check.code === 0 || (check.stderr ?? '').includes('usage')
  } catch {
    return false
  }
}

/**
 * Transcribe audio blob using whisper-cpp.
 * Converts webm/opus → WAV via ffmpeg, then runs whisper-cpp.
 */
async function transcribeAudio(audioBlob: Blob, lang = 'ja'): Promise<string> {
  const dir = await tempDir()
  const ts = Date.now()
  const srcPath = await join(dir, `local-llm-audio-${ts}.webm`)
  const wavPath = await join(dir, `local-llm-audio-${ts}.wav`)

  // Write the raw recorded blob (webm/opus)
  const buffer = await audioBlob.arrayBuffer()
  await writeFile(srcPath, new Uint8Array(buffer))

  try {
    // Convert to 16kHz mono PCM WAV required by whisper-cpp
    const ffmpegOut = await Command.create(FFMPEG_BIN, [
      '-y',
      '-i', srcPath,
      '-ar', '16000',
      '-ac', '1',
      '-c:a', 'pcm_s16le',
      wavPath,
    ]).execute()

    if (ffmpegOut.code !== 0) {
      throw new Error(`音声変換エラー: ${ffmpegOut.stderr || '不明なエラー'}`)
    }

    const modelPath = await getModelPath()

    const args = [
      '--model', modelPath,
      '--language', lang,
      '--no-timestamps',
      wavPath,
    ]

    const output = await Command.create(WHISPER_BIN, args).execute()

    if (output.code !== 0) {
      throw new Error(`Whisper エラー: ${output.stderr || '不明なエラー'}`)
    }

    const transcript = (output.stdout || output.stderr || '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .trim()

    if (!transcript) {
      throw new Error('音声からテキストを認識できませんでした')
    }

    return transcript
  } finally {
    await remove(srcPath).catch(() => {})
    await remove(wavPath).catch(() => {})
  }
}

export { checkWhisperAvailable, transcribeAudio }
