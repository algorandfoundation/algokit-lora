import { ApplicationResult } from '@/features/applications/data/types'
import { AssetResult } from '@/features/assets/data/types'
import type {
  Account as IndexerAccount,
  ApplicationLocalState as IndexerApplicationLocalState,
  AssetHolding as IndexerAssetHolding,
} from '@algorandfoundation/algokit-utils/indexer-client'

// TODO: PD - can we convert this to ReadableAddress?
export type Address = string

export type AppLocalState = Omit<IndexerApplicationLocalState, 'closedOutAtRound' | 'deleted' | 'optedInAtRound'>
export type AssetHoldingResult = Omit<IndexerAssetHolding, 'deleted' | 'optedInAtRound' | 'optedOutAtRound'>

export type AccountResult = Omit<
  IndexerAccount,
  'closedAtRound' | 'createdAtRound' | 'deleted' | 'appsLocalState' | 'assets' | 'createdApps' | 'createdAssets'
> & {
  appsLocalState?: AppLocalState[]
  assets?: AssetHoldingResult[]
  createdApps?: ApplicationResult[]
  createdAssets?: AssetResult[]
}
