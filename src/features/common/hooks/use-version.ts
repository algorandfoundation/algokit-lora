import { useEffect, useState } from 'react'
import { getVersion } from '@tauri-apps/api/app'
import config from '@/config'

interface VersionInfo {
  version: string
  buildDate: string
  commitHash: string
  environment: 'development' | 'staging' | 'production'
  isTauri: boolean
}

export const useVersion = (): VersionInfo => {
  const [tauriVersion, setTauriVersion] = useState<string | null>(null)
  const [isTauri, setIsTauri] = useState(false)

  useEffect(() => {
    if (window.__TAURI_INTERNALS__) {
      setIsTauri(true)
      getVersion()
        .then((v) => setTauriVersion(v))
        .catch((error) => {
          // Log error but don't throw - fallback to web version
          // eslint-disable-next-line no-console
          console.warn('Failed to get Tauri version:', error)
        })
    }
  }, [])

  return {
    version: isTauri && tauriVersion ? tauriVersion : config.version.app,
    buildDate: config.version.build,
    commitHash: config.version.commit,
    environment: config.version.environment,
    isTauri,
  }
}
