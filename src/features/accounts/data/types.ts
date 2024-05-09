import { ApplicationResult, AssetHolding, AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'

export type Address = string

export type AccountResult = {
  address: Address
  amount: number
  assets?: AssetHolding[]
  round: number
  'min-balance': number
  'auth-addr'?: Address
  'total-assets-opted-in': number
  'total-apps-opted-in': number
  'total-created-apps': number
  'total-created-assets': number
  'created-assets'?: AssetResult[]
  'created-apps'?: ApplicationResult[]
}
