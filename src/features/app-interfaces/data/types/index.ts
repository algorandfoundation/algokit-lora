import { AlgoAppSpec as Arc32AppSpec } from '@/features/app-interfaces/data/types/arc-32/application'
import { AbiContract as Arc4AppSpec } from '@/features/app-interfaces/data/types/arc-32/application'
import { ApplicationId } from '@/features/applications/data/types'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56'

export enum AppSpecStandard {
  ARC32 = 'ARC-32',
  ARC4 = 'ARC-4',
  ARC56 = 'ARC-56',
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
  | {
      standard: AppSpecStandard.ARC56
      roundFirstValid?: number
      roundLastValid?: number
      appSpec: Arc56Contract
    }

export type { Arc32AppSpec, Arc4AppSpec }

export type AppSpec = Arc32AppSpec | Arc4AppSpec | Arc56Contract

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
  appSpec?: AppSpec
  name?: string
  version?: string
  roundFirstValid?: bigint
  roundLastValid?: bigint
  updatable?: boolean
  deletable?: boolean
  templateParams?: TemplateParam[]
}
