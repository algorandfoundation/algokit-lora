import { useEffect } from 'react'
import { checkForAppUpdates } from './updater'

export const useCheckForAppUpdates = () => {
  useEffect(() => {
    ;(async () => {
      if (window.__TAURI_INTERNALS__) {
        await checkForAppUpdates()
      }
    })()
  }, [])
}
