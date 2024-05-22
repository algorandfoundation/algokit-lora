import { AssetSummary } from '@/features/assets/models'
import { AccountResult, AssetHoldingResult, AssetResult } from '../data/types'
import { Account, AccountAssetSummary, AssetHolding } from '../models'
import { asJson } from '@/utils/as-json'
import { microAlgos } from '@algorandfoundation/algokit-utils'

export const asAccount = async (
  accountResult: AccountResult,
  assetResolver: (assetId: number) => Promise<AssetSummary> | AssetSummary
): Promise<Account> => {
  const asAccountAssetSummary = createAccountSummaryMapper(assetResolver)

  const assetsHoldings = await asAssetHoldings(accountResult.assets ?? [], asAccountAssetSummary)
  const [assetsHeld, assetsOpted] = assetsHoldings.reduce(
    (acc, asset) => {
      if (asset.amount === 0) {
        acc[1].push(asset)
      } else {
        acc[0].push(asset)
      }
      return acc
    },
    [[], []] as [AssetHolding[], AssetHolding[]]
  )

  return {
    address: accountResult.address,
    balance: microAlgos(accountResult.amount),
    minBalance: microAlgos(accountResult['min-balance']),
    totalApplicationsCreated: accountResult['total-created-apps'],
    totalApplicationsOptedIn: accountResult['total-apps-opted-in'],
    applicationCreated: accountResult['created-apps'] ?? [],
    assetsHeld,
    assetsCreated: await asAccountAssetSummaries(accountResult['created-assets'] ?? [], asAccountAssetSummary),
    assetsOpted,
    rekeyedTo: accountResult['auth-addr'],
    json: asJson(accountResult),
  }
}

const createAccountSummaryMapper =
  (assetResolver: (assetId: number) => Promise<AssetSummary> | AssetSummary) =>
  async (asset: AssetResult | AssetHoldingResult): Promise<AccountAssetSummary> => {
    const assetId = 'index' in asset ? asset.index : asset['asset-id']
    const { clawback: _clawback, ...assetSummary } = await assetResolver(assetId)
    return assetSummary
  }

const asAssetHoldings = async (
  heldAssets: AssetHoldingResult[],
  asAccountSummary: (asset: AssetHoldingResult) => Promise<AccountAssetSummary>
): Promise<AssetHolding[]> => {
  return Promise.all(
    heldAssets.map(async (asset) => {
      const assetSummary = await asAccountSummary(asset)
      return {
        asset: assetSummary,
        amount: asset.amount,
        isFrozen: asset['is-frozen'],
      }
    })
  )
}

const asAccountAssetSummaries = async (
  createdAssets: AssetResult[],
  asAccountSummary: (asset: AssetResult) => Promise<AccountAssetSummary>
): Promise<AccountAssetSummary[]> => {
  return Promise.all(
    createdAssets.map(async (asset) => {
      return await asAccountSummary(asset)
    })
  )
}
