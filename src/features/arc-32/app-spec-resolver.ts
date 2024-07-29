import { Getter } from 'jotai'
import { applicationArc32AppSpec } from '@/features/applications/data/application-metadata'
import { AlgoAppSpec } from '@/features/arc-32/application'

export const appSpecResolverBuilder =
  (get: Getter) =>
  (appId: number): AlgoAppSpec | undefined => {
    const appSpecs = get(applicationArc32AppSpec)
    return appSpecs[appId]
  }
