import { useState } from 'react'
import { useChat } from '../hooks/useChat'
import { useChatStore } from '../stores/chatStore'

function Sidebar() {
  const { sessions, activeSessionId } = useChatStore()
  const { startNewSession, removeSession, setActiveSession, archiveActiveSession } = useChat()
  const [archiveStatus, setArchiveStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [archiveMessage, setArchiveMessage] = useState<string | null>(null)

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('この会話を削除しますか？')) {
      removeSession(id)
    }
  }

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setArchiveStatus('saving')
    setArchiveMessage(null)
    try {
      const path = await archiveActiveSession()
      setArchiveStatus('done')
      setArchiveMessage(`保存しました: ${path}`)
    } catch (err) {
      setArchiveStatus('error')
      const msg = err instanceof Error ? err.message : String(err)
      setArchiveMessage(msg || '保存に失敗しました')
    } finally {
      setTimeout(() => {
        setArchiveStatus('idle')
        setArchiveMessage(null)
      }, 4000)
    }
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const canArchive = !!activeSession && activeSession.messages.length > 0

  return (
    <div className="w-56 flex flex-col border-r border-gray-200 bg-gray-50 h-full">
      <div className="p-3 flex flex-col gap-2">
        <button
          onClick={startNewSession}
          className="w-full py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          ＋ 新しい会話
        </button>
        <button
          onClick={handleArchive}
          disabled={!canArchive || archiveStatus === 'saving'}
          title="現在の会話をMarkdownで保存"
          className="w-full py-2 px-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-40 text-gray-700 text-sm font-medium rounded-lg transition-colors"
        >
          {archiveStatus === 'saving' ? '保存中…' : '📥 アーカイブ'}
        </button>
        {archiveMessage && (
          <p
            className={`text-xs px-1 break-all ${archiveStatus === 'error' ? 'text-red-500' : 'text-green-600'}`}
          >
            {archiveMessage}
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <p className="text-xs text-gray-400 px-4 py-3">会話履歴なし</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={`group flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-100 ${
                session.id === activeSessionId ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800 truncate">{session.title}</p>
                <p className="text-xs text-gray-400">{formatDate(session.updatedAt)}</p>
              </div>
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className="ml-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs px-1 transition-opacity"
                title="削除"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export { Sidebar }
