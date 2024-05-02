import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { atomEffect } from 'jotai-effect'
import { assetsWithMetadataAtom } from './core'
import { AssetWithMetadata, AssetWithMetadataAndTransaction } from '../models'
import { useMemo } from 'react'
import { AssetIndex } from './types'
import { loadable } from 'jotai/utils'
import { fetchAssetResultAtomBuilder } from './asset'
import { asAsset } from '../mappers'
import { useAssetTransactionResultsAtom } from './asset-transaction-results'
import { fetchAssetMetadataAtomBuilder } from './asset-metadata'
import { fetchTransactionsAtomBuilder } from '@/features/transactions/data'

const getAssetWithMetadataAtomBuilder = (
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

    const assetWithMetadata = assetsWithMetadata.get(assetIndex)
    if (assetWithMetadata) {
      return assetWithMetadata
    }

    get(syncEffect)

    // TODO: do we need store. here?
    const assetResult = await get(fetchAssetResultAtomBuilder(assetIndex))
    const assetMetadata = await get(fetchAssetMetadataAtomBuilder(assetResult, assetTransactionResults))

    const asset = asAsset(assetResult)
    // const transactions = (await get(fetchTransactionsAtomBuilder(store, assetTransactionResults))).sort(
    //   (a, b) => b.confirmedRound - a.confirmedRound
    // )

    return {
      ...asset,
      transactionResults: assetTransactionResults,
      metadata: assetMetadata,
    } satisfies AssetWithMetadata
  })

  return assetMetadataAtom
}

const getAssetWithMetadataAndTransactionsAtomBuilder = (
  store: JotaiStore,
  assetIndex: AssetIndex,
  assetTransactionResultsAtom: ReturnType<typeof useAssetTransactionResultsAtom>
) => {
  return atom(async (get) => {
    const assetMetadataAtom = await get(getAssetWithMetadataAtomBuilder(assetIndex, assetTransactionResultsAtom))
    const transactions = (await get(fetchTransactionsAtomBuilder(store, assetMetadataAtom.transactionResults))).sort(
      (a, b) => b.confirmedRound - a.confirmedRound
    )

    // TODO: see if we can avoid the spread operation here because it will include the transactionResults
    return {
      ...assetMetadataAtom,
      transactions,
    } satisfies AssetWithMetadataAndTransaction
  })
}

export const useAssetWithMetadataAtom = (assetIndex: AssetIndex) => {
  const store = useStore()
  const assetsTransactionResultsAtom = useAssetTransactionResultsAtom(assetIndex)

  return useMemo(() => {
    return getAssetWithMetadataAndTransactionsAtomBuilder(store, assetIndex, assetsTransactionResultsAtom)
  }, [store, assetIndex, assetsTransactionResultsAtom])
}

export const useLoadableAssetWithMetadataAtom = (assetIndex: AssetIndex) => {
  return useAtomValue(loadable(useAssetWithMetadataAtom(assetIndex)))
}
