import { AlgoAppSpec as Arc32AppSpec } from '@/features/app-interfaces/data/types/arc-32/application'
import { AbiContract as Arc4AppSpec } from '@/features/app-interfaces/data/types/arc-32/application'

export enum AppSpecStandard {
  ARC32 = 'ARC-32',
  ARC4 = 'ARC-4',
}

export type AppSpecVersion =
  | {
      standard: AppSpecStandard.ARC32
      roundFirstValid?: number
      roundLastValid?: number
      appSpec: Arc32AppSpec
    }
  | {
      standard: AppSpecStandard.ARC4
      roundFirstValid?: number
      roundLastValid?: number
      appSpec: Arc4AppSpec
    }

export type { Arc32AppSpec, Arc4AppSpec }
