import { Getter } from 'jotai'
import { AlgoAppSpec } from './types/application'
import { appSpecsMiniDb } from '@/features/abi-methods/data'

export const appSpecResolverBuilder =
  (get: Getter) =>
  (appId: number): AlgoAppSpec | undefined => {
    return get(appSpecsMiniDb.item(appId.toString()))
  }
