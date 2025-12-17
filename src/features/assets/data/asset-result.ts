import { atom } from 'jotai'
import { AssetId, AssetResult } from './types'
import { asError, is404 } from '@/utils/error'
import { readOnlyAtomCache } from '@/features/common/data'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { algod, indexer } from '@/features/common/data/algo-client'
import { Getter, Setter } from 'jotai/index'
import { removeEncodableMethods } from '@/utils/remove-encodable-methods'

export const algoAssetResult: AssetResult = {
  index: 0n,
  createdAtRound: 0n,
  params: {
    creator: ZERO_ADDRESS,
    decimals: 6,
    total: 10_000_000_000_000_000n,
    name: 'ALGO',
    unitName: 'ALGO',
    url: 'https://www.algorand.foundation',
  },
}

const getAssetResult = async (_: Getter, __: Setter, assetId: AssetId) => {
  try {
    // Check algod first, as there can be some syncing delays to indexer
    const result = await algod.getAssetById(assetId)
    return removeEncodableMethods(result) as unknown as AssetResult
  } catch (e: unknown) {
    if (is404(asError(e))) {
      // Handle destroyed assets or assets that may not be available in algod potentially due to the node type
      const result = await indexer.lookupAssetById(assetId, { includeAll: true }) // Returns destroyed assets
      if (!result.asset) {
        throw new Error(`Asset ${assetId} not found`)
      }
      return removeEncodableMethods(result.asset) as unknown as AssetResult
    }
    throw e
  }
}

const keySelector = (assetId: AssetId) => assetId

export const [assetResultsAtom, getAssetResultAtom] = readOnlyAtomCache<
  Parameters<typeof keySelector>,
  ReturnType<typeof keySelector>,
  Promise<AssetResult> | AssetResult
>(getAssetResult, keySelector, new Map([[algoAssetResult.index, [atom(() => algoAssetResult), -1]]]))
