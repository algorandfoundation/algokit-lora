import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { Address } from '../data/types'
import { AssetSummary } from '@/features/assets/models'

export type AccountAssetSummary = Omit<AssetSummary, 'clawback'>

export type AssetHolding = {
  asset: AccountAssetSummary
  amount: number | bigint
  isFrozen: boolean
}

export type Account = {
  address: Address
  balance: AlgoAmount
  minBalance: AlgoAmount
  totalApplicationsCreated: number
  totalApplicationsOptedIn: number
  assetsHeld: AssetHolding[]
  assetsCreated: AccountAssetSummary[]
  assetsOpted: AssetHolding[]
  rekeyedTo?: Address
  json: string
}
