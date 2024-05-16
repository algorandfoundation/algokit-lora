import { NoStringIndex } from '@/features/common/data/types'
import {
  ApplicationResult as IndexerApplicationResult,
  AssetHolding as IndexerAssetHolding,
  AssetResult as IndexerAssetResult,
  AppLocalState as IndexerAppLocalState,
  AccountResult as IndexerAccountResult,
  SignatureType,
} from '@algorandfoundation/algokit-utils/types/indexer'

export type Address = string

export type AppLocalState = Omit<IndexerAppLocalState, 'closed-out-at-round' | 'deleted' | 'opted-in-at-round'>
export type AssetHolding = Omit<IndexerAssetHolding, 'deleted' | 'opted-in-at-round' | 'opted-out-at-round'>
export type ApplicationResult = Omit<IndexerApplicationResult, 'created-at-round' | 'deleted' | 'deleted-at-round'>
export type AssetResult = {
  index: number
  params: IndexerAssetResult['params']
}

export type AccountResult = Omit<
  NoStringIndex<IndexerAccountResult>,
  | 'closed-at-round'
  | 'created-at-round'
  | 'deleted'
  | 'apps-local-state'
  | 'assets'
  | 'created-apps'
  | 'created-assets'
  | 'min-balance'
  | 'total-box-bytes'
  | 'total-boxes'
  | 'sig-type'
> & {
  'apps-local-state'?: AppLocalState[]
  assets?: AssetHolding[]
  'created-apps'?: ApplicationResult[]
  'created-assets'?: AssetResult[]
  'min-balance': number
  'total-box-bytes'?: number
  'total-boxes'?: number
  'sig-type'?: SignatureType
}
