import { useEffect } from 'react'
import { ModelStatus } from './components/ModelStatus'
import { Sidebar } from './components/Sidebar'
import { ChatView } from './components/ChatView'
import { ChatInput } from './components/ChatInput'
import { ContextUsage } from './components/ContextUsage'
import { useModelStatus } from './hooks/useModelStatus'
import { useChatStore } from './stores/chatStore'
import { loadSessions } from './services/sessionStorage'

function App() {
  useModelStatus()

  const setSessions = useChatStore((s) => s.setSessions)

  useEffect(() => {
    loadSessions().then(setSessions)
  }, [setSessions])

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <ModelStatus />
        <ChatView />
        <ContextUsage />
        <ChatInput />
      </div>
    </div>
  )
}

export default App
