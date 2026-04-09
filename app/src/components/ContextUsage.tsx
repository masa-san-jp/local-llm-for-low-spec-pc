import { useContextLimit } from '../hooks/useContextLimit'

function ContextUsage() {
  const { used, limit, percentage, isWarning, isFull } = useContextLimit()

  if (used === 0) return null

  const pct = Math.min(Math.round(percentage * 100), 100)
  const barColor = isFull
    ? 'bg-red-500'
    : isWarning
      ? 'bg-yellow-500'
      : 'bg-blue-400'

  return (
    <div className="px-4 py-1.5 border-t border-gray-100 bg-gray-50">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={isWarning ? 'text-yellow-600 font-medium' : ''}>
          {used.toLocaleString()} / {limit.toLocaleString()} tokens
        </span>
      </div>
      {isFull && (
        <p className="text-xs text-red-500 mt-0.5">
          コンテキスト上限に達しています。古いメッセージは自動的にトリミングされます。
        </p>
      )}
    </div>
  )
}

export { ContextUsage }
