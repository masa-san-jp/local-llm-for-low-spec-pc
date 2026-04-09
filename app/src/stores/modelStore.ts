import { create } from 'zustand'
import type { ModelDescriptor, ModelStatus } from '../types/model'

interface ModelStore {
  status: ModelStatus
  currentModel: ModelDescriptor | null
  contextUsed: number
  contextLimit: number

  setStatus: (status: ModelStatus) => void
  setCurrentModel: (model: ModelDescriptor | null) => void
  updateContextUsage: (used: number) => void
  setContextLimit: (limit: number) => void
}

const useModelStore = create<ModelStore>((set) => ({
  status: 'not-installed',
  currentModel: null,
  contextUsed: 0,
  contextLimit: 8192,

  setStatus: (status) => set({ status }),
  setCurrentModel: (currentModel) => set({ currentModel }),
  updateContextUsage: (contextUsed) => set({ contextUsed }),
  setContextLimit: (contextLimit) => set({ contextLimit }),
}))

export { useModelStore }
