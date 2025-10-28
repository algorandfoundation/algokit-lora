import algosdk from '@algorandfoundation/algokit-utils/algosdk_legacy'
import { AvmValue } from '@/features/abi-methods/models'
import { AlgoAppSpec as Arc32AppSpec } from '@/features/app-interfaces/data/types/arc-32/application'
import { AbiContract as Arc4AppSpec } from '@/features/app-interfaces/data/types/arc-32/application'
import { ApplicationId } from '@/features/applications/data/types'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'

export enum AppSpecStandard {
  ARC32 = 'ARC-32',
  ARC4 = 'ARC-4',
  ARC56 = 'ARC-56',
}

export type AppSpecVersion =
  | {
      standard: AppSpecStandard.ARC32
      roundFirstValid?: bigint
      roundLastValid?: bigint
      appSpec: Arc32AppSpec
    }
  | {
      standard: AppSpecStandard.ARC4
      roundFirstValid?: bigint
      roundLastValid?: bigint
      appSpec: Arc4AppSpec
    }
  | {
      standard: AppSpecStandard.ARC56
      roundFirstValid?: bigint
      roundLastValid?: bigint
      appSpec: Arc56Contract
    }

export type { Arc32AppSpec, Arc4AppSpec }

export type AppSpec = Arc32AppSpec | Arc4AppSpec | Arc56Contract

export enum TemplateParamType {
  String = 'String',
  Number = 'Number',
  Uint8Array = 'Uint8Array',
}

export type UnknownTypeTemplateParam = {
  name: string
  type: TemplateParamType
  value: string
}
export type AVMTypeTemplateParam = {
  name: string
  value: AvmValue
}
export type ABITypeTemplateParam = {
  name: string
  abiType: algosdk.ABIType
  value: algosdk.ABIValue
}
export type TemplateParam = UnknownTypeTemplateParam | AVMTypeTemplateParam | ABITypeTemplateParam

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
