import { atom } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { atomEffect } from 'jotai-effect'
import { assetMetadataAtom } from './core'
import { AssetResult, TransactionResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { executePaginatedRequest } from '@algorandfoundation/algokit-utils'
import { indexer } from '@/features/common/data'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionType } from 'algosdk'
import { Arc3Or19MetadataResult, Arc69MetadataResult, AssetMetadataResult } from './types'
import { getArc19Url } from '../utils/get-arc-19-url'
import { getArc3Url } from '../utils/get-arc-3-url'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'

// This atom returns the array of ARC metadata for the asset result
// Currently, we support ARC-3, 16, 19 and 69. Their specs can be found here https://github.com/algorandfoundation/ARCs/tree/main/ARCs
// ARCs are community standard, therefore, there are edge cases
// For example:
// - An asset can follow ARC-69 and ARC-19 at the same time: https://allo.info/asset/1559471783/nft
// - An asset can follow ARC-3 and ARC-19 at the same time: https://allo.info/asset/1494117806/nft
// - ARC-19 doesn't specify the metadata format but it seems to be the same with ARC-3
export const buildAssetMetadataResult = async (
  assetResult: AssetResult,
  potentialMetadataTransaction?: TransactionResult
): Promise<AssetMetadataResult> => {
  const assetMetadata = {} as AssetMetadataResult

  // ARC3
  // ARC19
  // ARC69
  // ARC3 + ARC19
  // ARC19 + ARC69
  // ARC3 + ARC69
  // ARC3 + ARC19 + ARC69

  // TODO: NC - I think we can simplify this code as well
  if (assetResult.params.url?.includes('#arc3') || assetResult.params.url?.includes('@arc3')) {
    // When the URL contains #arc3 or @arc3, it follows ARC-3
    // If the URL starts with template-ipfs://, it also follows ARC-19
    // If the asset follows both ARC-3 and ARC-19, we add both metadata to the array

    const isAlsoArc19 = assetResult.params.url.startsWith('template-ipfs://')

    const metadataUrl = isAlsoArc19
      ? getArc19Url(assetResult.params.url, assetResult.params.reserve)
      : getArc3Url(assetResult.index, assetResult.params.url)

    if (metadataUrl) {
      const response = await fetch(metadataUrl)
      const metadataResult = (await response.json()) as Omit<Arc3Or19MetadataResult, 'metadata_url'>
      const metadata = {
        ...metadataResult,
        metadata_url: metadataUrl,
      } satisfies Arc3Or19MetadataResult

      assetMetadata.arc3 = metadata
      if (isAlsoArc19) {
        assetMetadata.arc19 = metadata
      }
    }
  } else if (assetResult.params.url?.startsWith('template-ipfs://')) {
    // If the asset doesn't follow ARC-3, but the URL starts with template-ipfs://, it follows ARC-19
    // There is no specs for ARC-19 metadata, but it seems to be the same with ARC-3

    const metadataUrl = getArc19Url(assetResult.params.url, assetResult.params.reserve)
    if (metadataUrl) {
      const response = await fetch(metadataUrl)
      const metadataResult = (await response.json()) as Omit<Arc3Or19MetadataResult, 'metadata_url'>
      const metadata = {
        ...metadataResult,
        metadata_url: metadataUrl,
      } satisfies Arc3Or19MetadataResult

      assetMetadata.arc19 = metadata
    }
  }

  // Check for ARC-69
  if (potentialMetadataTransaction && potentialMetadataTransaction.note) {
    const metadata = noteToArc69Metadata(potentialMetadataTransaction.note)
    if (metadata) {
      assetMetadata.arc69 = metadata
    }
  }

  return assetMetadata
}

const noteToArc69Metadata = (note: string | undefined) => {
  if (!note) {
    return undefined
  }

  const json = base64ToUtf8(note)
  if (json.match(/^{/) && json.includes('arc69')) {
    return JSON.parse(json) as Arc69MetadataResult
  }
  return undefined
}

export const fetchAssetMetadataAtomBuilder = (assetResult: AssetResult) =>
  atom(async (_get) => {
    // TODO: NC - We should be able to simplify this
    const results = await executePaginatedRequest(
      (response: TransactionSearchResults) => response.transactions,
      (nextToken) => {
        let s = indexer.searchForTransactions().assetID(assetResult.index).txType('acfg')
        if (nextToken) {
          s = s.nextToken(nextToken)
        }
        return s
      }
    )
    const assetConfigTransactionResults = results.flatMap(flattenTransactionResult).filter((t) => t['tx-type'] === TransactionType.acfg)
    // TODO: NC - Handle the scenario where the latest transaction is an asset destroy
    return await buildAssetMetadataResult(assetResult, assetConfigTransactionResults[assetConfigTransactionResults.length - 1])
  })

export const getAssetMetadataAtomBuilder = (store: JotaiStore, assetResult: AssetResult) => {
  const fetchAssetMetadataAtom = fetchAssetMetadataAtomBuilder(assetResult)

  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const assetMetadata = await get(fetchAssetMetadataAtom)
        set(assetMetadataAtom, (prev) => {
          const next = new Map(prev)
          next.set(assetResult.index, assetMetadata)
          return next
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  return atom(async (get) => {
    const assetMetadata = store.get(assetMetadataAtom)
    const cachedAssetMetadata = assetMetadata.get(assetResult.index)
    if (cachedAssetMetadata) {
      return cachedAssetMetadata
    }

    get(syncEffect)

    const assetMetadataResult = await get(fetchAssetMetadataAtom)
    return assetMetadataResult
  })
}
