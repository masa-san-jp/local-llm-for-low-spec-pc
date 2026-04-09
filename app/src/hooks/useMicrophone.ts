import { useState, useRef, useCallback } from 'react'
import { transcribeAudio } from '../services/whisperClient'

type MicState = 'idle' | 'recording' | 'transcribing' | 'error'

interface UseMicrophoneResult {
  micState: MicState
  startRecording: () => Promise<void>
  stopRecording: () => void
  errorMessage: string | null
}

function useMicrophone(onTranscript: (text: string) => void): UseMicrophoneResult {
  const [micState, setMicState] = useState<MicState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setErrorMessage(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setMicState('transcribing')
        try {
          const text = await transcribeAudio(blob)
          onTranscript(text)
          setMicState('idle')
        } catch (err) {
          setErrorMessage(err instanceof Error ? err.message : '文字起こしに失敗しました')
          setMicState('error')
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start(250) // collect chunks every 250ms
      setMicState('recording')
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'マイクのアクセス許可が必要です'
          : 'マイクを開けませんでした'
      setErrorMessage(msg)
      setMicState('error')
    }
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  return { micState, startRecording, stopRecording, errorMessage }
}

export { useMicrophone }
export type { MicState }
