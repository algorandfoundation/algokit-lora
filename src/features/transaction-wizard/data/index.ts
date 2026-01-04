import { Arc56Contract } from '@algorandfoundation/algokit-utils/abi'
import { ApplicationId } from '@/features/applications/data/types'
import { useMemo } from 'react'
import { atom, useAtomValue } from 'jotai/index'
import { asArc56AppSpec, asMethodDefinitions } from '@/features/applications/mappers'
import { loadable } from 'jotai/utils'
import { createAppSpecAtom } from '@/features/applications/data/application-method-definitions'

export enum TransactionBuilderMode {
  Create,
  Edit,
}

export const useLoadableArc56AppSpecWithMethodDefinitions = (appSpec?: Arc56Contract, applicationId?: ApplicationId) => {
  const applicationMethodDefinitionsAtom = useMemo(() => {
    if (appSpec) {
      return atom(() =>
        Promise.resolve({
          appSpec,
          methodDefinitions: asMethodDefinitions(appSpec),
        })
      )
    } else if (applicationId) {
      return atom(async (get) => {
        const appSpec = await get(createAppSpecAtom(applicationId))
        if (appSpec) {
          return {
            appSpec: asArc56AppSpec(appSpec),
            methodDefinitions: asMethodDefinitions(appSpec),
          }
        } else {
          return undefined
        }
      })
    }

    return atom(() => Promise.resolve(undefined))
  }, [appSpec, applicationId])
  return useAtomValue(loadable(applicationMethodDefinitionsAtom))
}
