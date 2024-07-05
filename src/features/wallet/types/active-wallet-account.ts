import { Address } from '@/features/accounts/data/types'
import { AssetId } from '@/features/assets/data/types'

export type ActiveWalletAccount = {
  address: Address
  assetHolding: Map<AssetId, AccountAssetHolding>
}
type AccountAssetHolding = {
  amount: number | bigint
}