import { MiniDb } from 'jotai-minidb'
import { ApplicationId } from '@/features/applications/data/types'
import { useSetAtom } from 'jotai'
import { mapJsonToArc32AppSpec } from '@/features/abi-methods/mappers'
import { useCallback } from 'react'
import { AppSpec } from '@/features/abi-methods/models'

export const appSpecsMiniDb = new MiniDb<AppSpec>({ name: 'app-specs' })

export const useSetAppSpec = (applicationId: ApplicationId, standard: 'ARC-32') => {
  const setAppSpec = useSetAtom(appSpecsMiniDb.item(applicationId.toString()))

  return useCallback(
    (json: unknown) => {
      setAppSpec((prev) => {
        // Currently we only support ARC-32
        if (standard === 'ARC-32') {
          return { ...prev, arc32: mapJsonToArc32AppSpec(json) }
        }
        throw new Error(`Unknown standard ${standard}`)
      })
    },
    [setAppSpec, standard]
  )
}
