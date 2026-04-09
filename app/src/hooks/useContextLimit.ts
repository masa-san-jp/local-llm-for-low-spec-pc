import { useMemo } from 'react'
import { estimateSessionTokens } from '../utils/tokenEstimator'
import { useChatStore } from '../stores/chatStore'
import { useModelStore } from '../stores/modelStore'

const WARNING_THRESHOLD = 0.8

function useContextLimit() {
  const getActiveSession = useChatStore((s) => s.getActiveSession)
  const { contextLimit, updateContextUsage } = useModelStore()

  const session = getActiveSession()

  const used = useMemo(() => {
    if (!session) return 0
    return estimateSessionTokens(session.messages)
  }, [session])

  useMemo(() => {
    updateContextUsage(used)
  }, [used, updateContextUsage])

  const percentage = contextLimit > 0 ? used / contextLimit : 0
  const isWarning = percentage >= WARNING_THRESHOLD
  const isFull = percentage >= 1

  return { used, limit: contextLimit, percentage, isWarning, isFull }
}

export { useContextLimit }
