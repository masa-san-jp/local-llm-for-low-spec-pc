import { useState, useRef, useCallback, useEffect } from 'react'

interface UseWebcamResult {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isOpen: boolean
  openCamera: () => Promise<void>
  closeCamera: () => void
  captureFrame: () => Promise<Blob | null>
  errorMessage: string | null
}

function useWebcam(): UseWebcamResult {
  const [isOpen, setIsOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const openCamera = useCallback(async () => {
    setErrorMessage(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsOpen(true)
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'カメラのアクセス許可が必要です'
          : 'カメラを開けませんでした'
      setErrorMessage(msg)
    }
  }, [])

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsOpen(false)
  }, [])

  const captureFrame = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current
    if (!video || !streamRef.current) return null

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0)

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return { videoRef, isOpen, openCamera, closeCamera, captureFrame, errorMessage }
}

export { useWebcam }
