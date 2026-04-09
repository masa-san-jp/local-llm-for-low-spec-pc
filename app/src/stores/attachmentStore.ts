import { create } from 'zustand'
import type { Attachment } from '../types/attachment'

interface AttachmentStore {
  attachments: Attachment[]
  addAttachment: (attachment: Attachment) => void
  updateAttachment: (id: string, patch: Partial<Attachment>) => void
  removeAttachment: (id: string) => void
  clearAttachments: () => void
}

const useAttachmentStore = create<AttachmentStore>((set) => ({
  attachments: [],

  addAttachment: (attachment) =>
    set((state) => ({ attachments: [...state.attachments, attachment] })),

  updateAttachment: (id, patch) =>
    set((state) => ({
      attachments: state.attachments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  removeAttachment: (id) =>
    set((state) => {
      const att = state.attachments.find((a) => a.id === id)
      if (att?.previewUrl) URL.revokeObjectURL(att.previewUrl)
      return { attachments: state.attachments.filter((a) => a.id !== id) }
    }),

  clearAttachments: () =>
    set((state) => {
      state.attachments.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl)
      })
      return { attachments: [] }
    }),
}))

export { useAttachmentStore }
