import { MiniDb } from 'jotai-minidb'
import { AlgoAppSpec } from './types/application'
import { ApplicationId } from '@/features/applications/data/types'
import { useAtom } from 'jotai'
import { mapJsonToAppSpec } from '@/features/abi-methods/mappers'
import { useCallback } from 'react'

export const appSpecsMiniDb = new MiniDb<AlgoAppSpec>({ name: 'app-specs' })

export const useAppSpec = (applicationId: ApplicationId) => {
  return useAtom(appSpecsMiniDb.item(applicationId.toString()))
}

export const useSetAppSpec = (applicationId: ApplicationId) => {
  const [_, setAppSpec] = useAppSpec(applicationId)

  return useCallback(
    (json: unknown) => {
      const appSpec = mapJsonToAppSpec(json)
      setAppSpec(appSpec)
    },
    [setAppSpec]
  )
}
