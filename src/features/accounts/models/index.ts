import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { Address } from '../data/types'
import { AssetSummary } from '@/features/assets/models'
import { ApplicationId } from '@/features/applications/data/types'
import { Atom } from 'jotai'
import { AssetId } from '@/features/assets/data/types'

export type AccountAssetSummary = {
  assetId: AssetId
  asset: Atom<Promise<AssetSummary> | AssetSummary>
}

export type AssetHolding = AccountAssetSummary & {
  amount: number | bigint
  isFrozen: boolean
}
export type AccountApplicationSummary = {
  id: ApplicationId
}

export type Account = {
  address: Address
  balance: AlgoAmount
  minBalance: AlgoAmount
  applicationsCreated: AccountApplicationSummary[]
  applicationsOpted: AccountApplicationSummary[]
  assetsHeld: AssetHolding[]
  assetsCreated: AccountAssetSummary[]
  assetsOpted: AssetHolding[]
  rekeyedTo?: Address
  json: object
}
