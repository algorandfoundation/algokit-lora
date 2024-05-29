import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { Address } from '../data/types'
import { AssetSummary } from '@/features/assets/models'
import { ApplicationId } from '@/features/applications/data/types'
import { AssetId } from '@/features/assets/data/types'
import { AsyncMaybeAtom } from '@/features/common/data/types'

export type AccountAssetSummary = {
  assetId: AssetId
  asset: AsyncMaybeAtom<AssetSummary>
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
