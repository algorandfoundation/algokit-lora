import { AlgoAppSpec as Arc32AppSpec } from '@/features/app-interfaces/data/types/arc-32/application'
import { AbiContract as Arc4AppSpec } from '@/features/app-interfaces/data/types/arc-32/application'
import { ApplicationId } from '@/features/applications/data/types'

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

export enum TemplateParamType {
  String = 'String',
  Number = 'Number',
  Uint8Array = 'Uint8Array',
}

export type TemplateParam = {
  name: string
  type: TemplateParamType
  value: string
}

export type CreateAppInterfaceContext = {
  applicationId?: ApplicationId
  file?: File
  appSpec?: Arc32AppSpec | Arc4AppSpec
  name?: string
  version?: string
  roundFirstValid?: bigint
  roundLastValid?: bigint
  updatable?: boolean
  deletable?: boolean
  templateParams?: TemplateParam[]
}
