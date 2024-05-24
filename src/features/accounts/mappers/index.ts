import { AssetSummary } from '@/features/assets/models'
import { AccountResult, AssetHoldingResult, AssetResult } from '../data/types'
import { Account, AccountAssetSummary, AssetHolding } from '../models'
import { microAlgos } from '@algorandfoundation/algokit-utils'
import { Atom } from 'jotai'

export const asAccount = (
  accountResult: AccountResult,
  assetResolver: (assetId: number) => Atom<Promise<AssetSummary> | AssetSummary>
): Account => {
  const [assetsHeld, assetsOpted] = asAssetHoldings(accountResult.assets ?? [], assetResolver)

  return {
    address: accountResult.address,
    balance: microAlgos(accountResult.amount),
    minBalance: microAlgos(accountResult['min-balance']),
    applicationsCreated: (accountResult['created-apps'] ?? []).map((app) => ({ id: app.id })),
    applicationsOpted: (accountResult['apps-local-state'] ?? []).map((app) => ({ id: app.id })),
    assetsHeld,
    assetsCreated: asAccountAssetSummaries(accountResult['created-assets'] ?? [], assetResolver),
    assetsOpted,
    rekeyedTo: accountResult['auth-addr'],
    json: accountResult,
  }
}

const asAssetHoldings = (
  heldAssets: AssetHoldingResult[],
  assetResolver: (assetId: number) => Atom<Promise<AssetSummary> | AssetSummary>
): [AssetHolding[], AssetHolding[]] =>
  heldAssets.reduce(
    (acc, result) => {
      const assetId = result['asset-id']
      const asset = {
        assetId,
        asset: assetResolver(assetId),
        amount: result.amount,
        isFrozen: result['is-frozen'],
      }
      if (result.amount === 0) {
        acc[1].push(asset)
      } else {
        acc[0].push(asset)
      }
      return acc
    },
    [[], []] as [AssetHolding[], AssetHolding[]]
  )

const asAccountAssetSummaries = (
  createdAssets: AssetResult[],
  assetResolver: (assetId: number) => Atom<Promise<AssetSummary> | AssetSummary>
): AccountAssetSummary[] =>
  createdAssets.map((asset) => {
    return {
      assetId: asset.index,
      asset: assetResolver(asset.index),
    }
  })
