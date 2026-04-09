export interface ModelDescriptor {
  id: string
  name: string
  supportsText: boolean
  supportsImage: boolean
  supportsStreaming: boolean
  minMemoryGb: number
  recommendedMemoryGb: number
  cpuOnlySupported: boolean
  requiresMmproj: boolean
}

export type ModelStatus = 'not-installed' | 'loading' | 'ready' | 'error'

export type InvocationRole = 'input' | 'chat'

export interface InvocationContext {
  role: InvocationRole
  contextLimit: number
  stream: boolean
  performanceMode: 'low' | 'balanced'
}

export const GEMMA4_E2B: ModelDescriptor = {
  id: 'gemma4:e2b',
  name: 'Gemma 4 E2B',
  supportsText: true,
  supportsImage: true,
  supportsStreaming: true,
  minMemoryGb: 6,
  recommendedMemoryGb: 16,
  cpuOnlySupported: true,
  requiresMmproj: true,
}
