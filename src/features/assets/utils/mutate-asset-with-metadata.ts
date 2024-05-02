import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AssetWithMetadata } from '../models'

export const mutatedAssetWithMetadata = (asset: AssetWithMetadata, transactionResult: TransactionResult): AssetWithMetadata => {
  return {
    ...asset,
    transactionResults: [...asset.transactionResults, transactionResult],
  }
}
