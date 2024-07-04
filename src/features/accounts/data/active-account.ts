import { Account } from '@txnlab/use-wallet'
import { Address } from '@/features/accounts/data/types'
import { AssetId } from '@/features/assets/data/types'
import { atom } from 'jotai'
import { getAccountInformation } from '@algorandfoundation/algokit-utils'
import { algod } from '@/features/common/data/algo-client'

export type ActiveAccount = {
  address: Address
  assetHolding: Map<AssetId, AccountAssetHolding>
}

type AccountAssetHolding = {
  amount: number | bigint
}

export const activeAccountAtom = atom<Promise<ActiveAccount> | ActiveAccount | undefined>(undefined)

export const getActiveAccount = async (account: Account | null | undefined) => {
  if (!account) return undefined

  const accountInformation = await getAccountInformation(account.address, algod)
  const assetHolding = accountInformation?.assets ?? []

  return {
    address: account.address,
    // TODO: check if the assetId is a number or bigint
    assetHolding: new Map(assetHolding.map((asset) => [Number(asset.assetId), { amount: asset.amount }])),
  }
}
