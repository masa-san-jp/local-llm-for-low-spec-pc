export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  tokenCount: number
  /** Preview URLs for attached images (display only) */
  imagePreviews?: string[]
}

export interface Session {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  modelId: string
  contextLimit: number
}

export interface ChatState {
  sessions: Session[]
  activeSessionId: string | null
  isGenerating: boolean
  streamingContent: string
  error: string | null
}
