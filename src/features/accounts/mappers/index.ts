import { AssetSummary } from '@/features/assets/models'
import { AccountResult, AssetHoldingResult } from '../data/types'
import { Account, AccountAssetSummary, AssetHolding } from '../models'
import { microAlgos } from '@algorandfoundation/algokit-utils'
import { AsyncMaybeAtom } from '@/features/common/data/types'
import { asJson } from '@/utils/as-json'
import { AssetId, AssetResult } from '@/features/assets/data/types'

export const asAccount = (accountResult: AccountResult, assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>): Account => {
  const [assetsHeld, assetsOpted] = asAssetHoldings(accountResult.assets ?? [], assetResolver)

  return {
    address: accountResult.address,
    balance: microAlgos(accountResult.amount),
    minBalance: microAlgos(accountResult.minBalance),
    totalApplicationsCreated: accountResult.totalCreatedApps,
    applicationsCreated: (accountResult.createdApps ?? []).map((app) => ({ id: app.id })),
    totalApplicationsOptedIn: accountResult.totalAppsOptedIn,
    applicationsOpted: (accountResult.appsLocalState ?? []).map((app) => ({ id: app.id })),
    totalAssetsHeld: accountResult.assets !== undefined ? assetsHeld.length : undefined,
    assetsHeld,
    totalAssetsCreated: accountResult.totalCreatedAssets,
    assetsCreated: asAccountAssetSummaries(accountResult.createdAssets ?? [], assetResolver),
    totalAssetsOptedIn: accountResult.totalAssetsOptedIn,
    assetsOpted,
    rekeyedTo: accountResult.authAddr?.toString(),
    json: asJson(accountResult),
  }
}

const asAssetHoldings = (
  heldAssets: AssetHoldingResult[],
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>
): [AssetHolding[], AssetHolding[]] =>
  heldAssets.reduce(
    (acc, result) => {
      const assetId = result.assetId
      const asset = {
        assetId,
        asset: assetResolver(assetId),
        amount: result.amount,
        isFrozen: result.isFrozen,
      }
      if (result.amount === 0n) {
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
  assetResolver: (assetId: AssetId) => AsyncMaybeAtom<AssetSummary>
): AccountAssetSummary[] =>
  createdAssets.map((asset) => {
    return {
      assetId: asset.index,
      asset: assetResolver(asset.index),
    }
  })
