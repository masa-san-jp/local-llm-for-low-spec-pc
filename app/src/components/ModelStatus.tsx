import { useModelStore } from '../stores/modelStore'
import type { ModelStatus } from '../types/model'

const STATUS_CONFIG: Record<ModelStatus, { label: string; color: string; dot: string }> = {
  ready: { label: 'Gemma 4 E2B — 準備完了', color: 'text-green-600', dot: 'bg-green-500' },
  loading: { label: 'モデル読み込み中…', color: 'text-yellow-600', dot: 'bg-yellow-500 animate-pulse' },
  'not-installed': { label: 'モデル未インストール', color: 'text-red-500', dot: 'bg-red-500' },
  error: { label: 'Ollama に接続できません', color: 'text-red-500', dot: 'bg-red-500' },
}

function ModelStatus() {
  const status = useModelStore((s) => s.status)
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm border-b border-gray-200 bg-gray-50">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
      <span className={config.color}>{config.label}</span>
      {(status === 'not-installed' || status === 'error') && (
        <span className="ml-2 text-gray-400">
          {status === 'not-installed'
            ? '— ollama pull gemma4:e2b を実行してください'
            : '— ollama serve を実行してください'}
        </span>
      )}
    </div>
  )
}

export { ModelStatus }
