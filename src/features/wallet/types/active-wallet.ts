import { Address } from '@/features/accounts/data/types'
import { AssetId } from '@/features/assets/data/types'
import { Nfd } from '@/features/nfd/data/types'

export type ActiveWalletAccount = {
  address: Address
  assetHolding: Map<AssetId, AccountAssetHolding>
  algoHolding: AccountAssetHolding
  minBalance: bigint
  validAtRound: bigint
  nfd: Nfd | null
}

type AccountAssetHolding = {
  amount: bigint
}
