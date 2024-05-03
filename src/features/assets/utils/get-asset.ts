import algosdk from 'algosdk'
import { executePaginatedRequest } from '@algorandfoundation/algokit-utils'
import { AssetResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { indexer } from '@/features/common/data'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { Asset } from '../models'
import { asAssetSummary } from '../mappers'
import { getAssetMetadata } from './get-asset-metadata'

const getAssetAssetConfigTransactionResults = async (assetIndex: number) => {
  const results = await executePaginatedRequest(
    (response: TransactionSearchResults) => response.transactions,
    (nextToken) => {
      let s = indexer.searchForTransactions().assetID(assetIndex).txType('acfg')
      if (nextToken) {
        s = s.nextToken(nextToken)
      }
      return s
    }
  )
  return results.flatMap(flattenTransactionResult).filter((t) => t['tx-type'] === algosdk.TransactionType.acfg)
}

export const getAsset = async (assetResult: AssetResult) => {
  const assetConfigTransactionResults = await getAssetAssetConfigTransactionResults(assetResult.index)

  const asset = asAssetSummary(assetResult)
  const assetMetadata = await getAssetMetadata(assetResult, assetConfigTransactionResults)

  return {
    ...asset,
    validRound: 0,
    metadata: assetMetadata,
  } satisfies Asset
}
