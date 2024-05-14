import {
  ApplicationResult as IndexerApplicationResult,
  AssetHolding as IndexerAssetHolding,
  AssetResult as IndexerAssetResult,
  AppLocalState as IndexerAppLocalState,
  AccountResult as IndexerAccountResult,
} from '@algorandfoundation/algokit-utils/types/indexer'

export type Address = string

export type AppLocalState = Omit<IndexerAppLocalState, 'closed-out-at-round' | 'deleted' | 'opted-in-at-round'>
export type AssetHolding = Omit<IndexerAssetHolding, 'deleted' | 'opted-in-at-round' | 'opted-out-at-round'>
export type ApplicationResult = Omit<IndexerApplicationResult, 'created-at-round' | 'deleted' | 'deleted-at-round'>
export type AssetResult = {
  index: number
  params: IndexerAssetResult['params']
}

export type AccountResult = Omit<IndexerAccountResult, 'closed-at-round' | 'created-at-round' | 'deleted'> & {
  'apps-local-state'?: AppLocalState[]
  assets?: AssetHolding[]
  'created-apps'?: ApplicationResult[]
  'created-assets'?: AssetResult[]
  'min-balance': number
  'total-box-bytes'?: number
  'total-boxes'?: number
}
