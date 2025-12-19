import { ApplicationResult, ApplicationStateSchema } from '@/features/applications/data/types'
import { AssetResult } from '@/features/assets/data/types'
import { SignatureType } from '@algorandfoundation/algokit-utils/types/indexer'
import type {
  Account as IndexerAccount,
  ApplicationLocalState as IndexerApplicationLocalState,
  AssetHolding as IndexerAssetHolding,
} from '@algorandfoundation/algokit-utils/indexer-client'

export type Address = string

export type AppLocalState = Omit<IndexerApplicationLocalState, 'closedOutAtRound' | 'deleted' | 'optedInAtRound' | 'schema'> & {
  schema: ApplicationStateSchema
}
export type AssetHoldingResult = Omit<IndexerAssetHolding, 'deleted' | 'optedInAtRound' | 'optedOutAtRound'>

export type AccountResult = Omit<
  IndexerAccount,
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
