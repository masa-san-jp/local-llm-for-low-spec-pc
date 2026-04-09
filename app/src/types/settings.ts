export interface ContextConfig {
  maxTokens: number
  warningThreshold: number
  trimmingStrategy: 'oldest-first' | 'manual'
}

export interface AppSettings {
  contextLimit: number
  defaultModel: string
  performanceMode: 'low' | 'balanced'
}

export const DEFAULT_SETTINGS: AppSettings = {
  contextLimit: 8192,
  defaultModel: 'gemma4:e2b',
  performanceMode: 'low',
}
