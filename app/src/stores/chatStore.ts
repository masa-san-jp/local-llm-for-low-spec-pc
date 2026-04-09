import { create } from 'zustand'
import type { Message, Session } from '../types/chat'

interface ChatStore {
  sessions: Session[]
  activeSessionId: string | null
  isGenerating: boolean
  streamingContent: string
  error: string | null

  setSessions: (sessions: Session[]) => void
  createSession: (modelId: string, contextLimit: number) => Session
  setActiveSession: (id: string | null) => void
  addMessage: (sessionId: string, message: Message) => void
  updateSessionMessages: (sessionId: string, messages: Message[]) => void
  appendStreamingContent: (chunk: string) => void
  clearStreamingContent: () => void
  setGenerating: (value: boolean) => void
  setError: (error: string | null) => void
  deleteSession: (id: string) => void
  updateSessionTitle: (id: string, title: string) => void
  getActiveSession: () => Session | null
}

const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  isGenerating: false,
  streamingContent: '',
  error: null,

  setSessions: (sessions) => set({ sessions }),

  createSession: (modelId, contextLimit) => {
    const session: Session = {
      id: crypto.randomUUID(),
      title: '新しい会話',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      modelId,
      contextLimit,
    }
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: session.id,
    }))
    return session
  },

  setActiveSession: (id) => set({ activeSessionId: id }),

  addMessage: (sessionId, message) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, message], updatedAt: Date.now() }
          : s,
      ),
    })),

  updateSessionMessages: (sessionId, messages) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, messages, updatedAt: Date.now() } : s,
      ),
    })),

  appendStreamingContent: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),

  clearStreamingContent: () => set({ streamingContent: '' }),

  setGenerating: (value) => set({ isGenerating: value }),

  setError: (error) => set({ error }),

  deleteSession: (id) =>
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== id)
      const activeSessionId =
        state.activeSessionId === id
          ? (sessions[0]?.id ?? null)
          : state.activeSessionId
      return { sessions, activeSessionId }
    }),

  updateSessionTitle: (id, title) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, title } : s)),
    })),

  getActiveSession: () => {
    const { sessions, activeSessionId } = get()
    return sessions.find((s) => s.id === activeSessionId) ?? null
  },
}))

export { useChatStore }
