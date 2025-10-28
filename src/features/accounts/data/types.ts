import algosdk from '@algorandfoundation/algokit-utils/algosdk_legacy'
import { ApplicationResult, ApplicationStateSchema } from '@/features/applications/data/types'
import { AssetResult } from '@/features/assets/data/types'
import { SignatureType } from '@algorandfoundation/algokit-utils/types/indexer'

export type Address = string

export type AppLocalState = Omit<
  algosdk.indexerModels.ApplicationLocalState,
  'getEncodingSchema' | 'toEncodingData' | 'closedOutAtRound' | 'deleted' | 'optedInAtRound' | 'schema'
> & {
  schema: ApplicationStateSchema
}
export type AssetHoldingResult = Omit<
  algosdk.indexerModels.AssetHolding,
  'getEncodingSchema' | 'toEncodingData' | 'deleted' | 'optedInAtRound' | 'optedOutAtRound'
>

export type AccountResult = Omit<
  algosdk.indexerModels.Account,
  | 'getEncodingSchema'
  | 'toEncodingData'
  | 'closedAtRound'
  | 'createdAtRound'
  | 'deleted'
  | 'appsLocalState'
  | 'assets'
  | 'createdApps'
  | 'createdAssets'
  | 'sigType'
  | 'appsTotalSchema'
  | 'totalBoxBytes'
  | 'totalBoxes'
  | 'minBalance'
> & {
  appsLocalState?: AppLocalState[]
  assets?: AssetHoldingResult[]
  createdApps?: ApplicationResult[]
  createdAssets?: AssetResult[]
  sigType?: SignatureType
  appsTotalSchema?: ApplicationStateSchema
  totalBoxBytes?: number
  totalBoxes?: number
  minBalance: bigint
}
