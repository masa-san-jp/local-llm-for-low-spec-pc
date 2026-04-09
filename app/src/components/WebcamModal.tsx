import { useCallback } from 'react'
import { useWebcam } from '../hooks/useWebcam'
import { useAttachment } from '../hooks/useAttachment'
import { detectKind } from '../types/attachment'

interface Props {
  onClose: () => void
}

function WebcamModal({ onClose }: Props) {
  const { videoRef, isOpen, openCamera, closeCamera, captureFrame, errorMessage } = useWebcam()
  const { addFiles } = useAttachment()

  const handleCapture = useCallback(async () => {
    const blob = await captureFrame()
    if (!blob) return

    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
    if (detectKind(file) === 'image') {
      await addFiles([file])
    }
    closeCamera()
    onClose()
  }, [captureFrame, addFiles, closeCamera, onClose])

  const handleClose = useCallback(() => {
    closeCamera()
    onClose()
  }, [closeCamera, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-[480px] max-w-[95vw]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-medium text-gray-800">📷 カメラ</span>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="bg-black relative" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isOpen && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
              {errorMessage ?? 'カメラを起動してください'}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4">
          {!isOpen ? (
            <button
              onClick={openCamera}
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              カメラを起動
            </button>
          ) : (
            <button
              onClick={handleCapture}
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              📸 撮影して添付
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm rounded-xl transition-colors"
          >
            キャンセル
          </button>
        </div>

        {errorMessage && (
          <p className="px-4 pb-3 text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    </div>
  )
}

export { WebcamModal }
