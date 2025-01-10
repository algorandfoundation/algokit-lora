import { getVersion } from '@tauri-apps/api/app'
import { useEffect, useState } from 'react'

export const useGetVersion = () => {
  const [version, setVersion] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (window.__TAURI_INTERNALS__) {
      getVersion().then((v) => setVersion(v))
    }
  }, [])

  return version
}
