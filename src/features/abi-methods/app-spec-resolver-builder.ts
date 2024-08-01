import { Getter } from 'jotai'
import { appSpecsMiniDb } from '@/features/abi-methods/data'
import { AppSpec } from '@/features/abi-methods/models'

export const appSpecResolverBuilder =
  (get: Getter) =>
  (appId: number): AppSpec | undefined => {
    return get(appSpecsMiniDb.item(appId.toString()))
  }
