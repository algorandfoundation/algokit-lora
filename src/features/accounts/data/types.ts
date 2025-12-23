import { ApplicationResult } from '@/features/applications/data/types'
import type {
  Account as IndexerAccount,
  ApplicationLocalState as IndexerApplicationLocalState,
  AssetHolding as IndexerAssetHolding,
} from '@algorandfoundation/algokit-utils/indexer-client'

export type Address = string

export type AppLocalState = Omit<IndexerApplicationLocalState, 'closedOutAtRound' | 'deleted' | 'optedInAtRound'>
export type AssetHoldingResult = Omit<IndexerAssetHolding, 'deleted' | 'optedInAtRound' | 'optedOutAtRound'>

export type AccountResult = Omit<
  IndexerAccount,
  'closedAtRound' | 'createdAtRound' | 'deleted' | 'appsLocalState' | 'assets' | 'createdApps' | 'totalBoxBytes' | 'totalBoxes'
> & {
  appsLocalState?: AppLocalState[]
  assets?: AssetHoldingResult[]
  createdApps?: ApplicationResult[]
  totalBoxBytes?: number
  totalBoxes?: number
}
