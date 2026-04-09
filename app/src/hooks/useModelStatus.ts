import { useEffect } from 'react'
import { ollamaClient } from '../services/ollamaClient'
import { useModelStore } from '../stores/modelStore'
import { useSettingsStore } from '../stores/settingsStore'

const POLL_INTERVAL_MS = 5000

function useModelStatus() {
  const { setStatus, setContextLimit } = useModelStore()
  const { defaultModel, contextLimit } = useSettingsStore()

  useEffect(() => {
    setContextLimit(contextLimit)

    async function check() {
      const status = await ollamaClient.getModelStatus(defaultModel)
      setStatus(status)
    }

    check()
    const interval = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [defaultModel, contextLimit, setStatus, setContextLimit])
}

export { useModelStatus }
