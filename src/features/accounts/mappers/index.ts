import { AssetSummary } from '@/features/assets/models'
import { AccountResult, AssetHoldingResult, AssetResult } from '../data/types'
import { Account, AccountAssetSummary, AssetHolding } from '../models'
import { microAlgos } from '@algorandfoundation/algokit-utils'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { asJson } from '@/utils/as-json'

export const asAccount = (accountResult: AccountResult, assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>): Account => {
  const [assetsHeld, assetsOpted] = asAssetHoldings(accountResult.assets ?? [], assetResolver)

  return {
    address: accountResult.address,
    balance: microAlgos(accountResult.amount),
    minBalance: microAlgos(accountResult['min-balance']),
    totalApplicationsCreated: accountResult['total-created-apps'],
    applicationsCreated: (accountResult['created-apps'] ?? []).map((app) => ({ id: app.id })),
    totalApplicationsOptedIn: accountResult['total-apps-opted-in'],
    applicationsOpted: (accountResult['apps-local-state'] ?? []).map((app) => ({ id: app.id })),
    totalAssetsHeld: accountResult.assets !== undefined ? assetsHeld.length : undefined,
    assetsHeld,
    totalAssetsCreated: accountResult['total-created-assets'],
    assetsCreated: asAccountAssetSummaries(accountResult['created-assets'] ?? [], assetResolver),
    totalAssetsOptedIn: accountResult['total-assets-opted-in'],
    assetsOpted,
    rekeyedTo: accountResult['auth-addr'],
    json: asJson(accountResult),
  }
}

const asAssetHoldings = (
  heldAssets: AssetHoldingResult[],
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>
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
  assetResolver: (assetId: number) => AsyncMaybeAtom<AssetSummary>
): AccountAssetSummary[] =>
  createdAssets.map((asset) => {
    return {
      assetId: asset.index,
      asset: assetResolver(asset.index),
    }
  })
