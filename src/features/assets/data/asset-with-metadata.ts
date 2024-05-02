import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { atomEffect } from 'jotai-effect'
import { assetsWithMetadataAtom } from './core'
import { AssetWithMetadata } from '../models'
import { useMemo } from 'react'
import { AssetIndex } from './types'
import { loadable } from 'jotai/utils'
import { getAssetResultAtomBuilder } from './asset'
import { asAsset } from '../mappers'
import { useAssetTransactionResultsAtom } from './asset-transaction-results'
import { getAssetMetadata } from '../utils/get-asset-metadata'
import { fetchTransactionsAtomBuilder } from '@/features/transactions/data'

const getAssetWithMetadataAtomBuilder = (
  store: JotaiStore,
  assetIndex: AssetIndex,
  assetTransactionResultsAtom: ReturnType<typeof useAssetTransactionResultsAtom>
) => {
  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const assetMetadata = await get(assetMetadataAtom)

        set(assetsWithMetadataAtom, (prev) => {
          return prev.set(assetIndex, assetMetadata)
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  const assetMetadataAtom = atom(async (get) => {
    const assetTransactionResults = await get(assetTransactionResultsAtom)
    const assetsWithMetadata = get(assetsWithMetadataAtom)
    let noCache = false

    const assetWithMetadata = assetsWithMetadata.get(assetIndex)
    if (assetWithMetadata) {
      if (assetWithMetadata.validRound === assetTransactionResults[assetTransactionResults.length - 1].confirmedRound) {
        return assetWithMetadata
      }

      if (assetTransactionResults.some((t) => t['confirmed-round']! > assetWithMetadata.validRound && t['tx-type'] === 'acfg')) {
        // If there are new asset config transactions, we need to fetch the asset again
        noCache = true
      }
    }

    get(syncEffect)

    const assetResult = await get(getAssetResultAtomBuilder(store, assetIndex, noCache))
    const assetMetadata =
      !assetWithMetadata || !noCache ? await getAssetMetadata(assetResult, assetTransactionResults) : assetWithMetadata.metadata

    const asset = asAsset(assetResult)
    const transactions = (await get(fetchTransactionsAtomBuilder(store, assetTransactionResults))).sort(
      (a, b) => b.confirmedRound - a.confirmedRound
    )

    return {
      ...asset,
      validRound: transactions[0].confirmedRound,
      transactions: transactions,
      metadata: assetMetadata,
    } satisfies AssetWithMetadata
  })

  return assetMetadataAtom
}

export const useAssetWithMetadataAtom = (assetIndex: AssetIndex) => {
  const store = useStore()
  const assetsTransactionResultsAtom = useAssetTransactionResultsAtom(assetIndex)

  return useMemo(() => {
    return getAssetWithMetadataAtomBuilder(store, assetIndex, assetsTransactionResultsAtom)
  }, [assetIndex, assetsTransactionResultsAtom, store])
}

export const useLoadableAssetWithMetadataAtom = (assetIndex: AssetIndex) => {
  return useAtomValue(loadable(useAssetWithMetadataAtom(assetIndex)))
}
