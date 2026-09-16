import { ApplicationResult, ApplicationStateSchema } from '@/features/applications/data/types'
import { AssetResult } from '@/features/assets/data/types'
import algosdk from 'algosdk'

export type Address = string

/**
 * The type of signature used by an account, as reported by the indexer.
 * Only present for accounts that have signed at least one transaction.
 */
export type AccountSignatureType = 'sig' | 'msig' | 'lsig' | 'pqsig'

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
  appsTotalSchema?: ApplicationStateSchema
  totalBoxBytes?: number
  totalBoxes?: number
  minBalance: bigint
}
