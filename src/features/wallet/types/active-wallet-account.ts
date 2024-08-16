import { Address } from '@/features/accounts/data/types'
import { AssetId } from '@/features/assets/data/types'

export type ActiveWalletAccount = {
  address: Address
  assetHolding: Map<AssetId, AccountAssetHolding>
  algoHolding: AccountAssetHolding
  minBalance: number
  validAtRound: number
}
type AccountAssetHolding = {
  amount: number | bigint
}
