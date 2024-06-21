import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import {
  AssetConfigTransaction,
  AssetConfigTransactionSubType,
  BaseAssetConfigTransaction,
  InnerAssetConfigTransaction,
  TransactionType,
} from '../models'
import { invariant } from '@/utils/invariant'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'

const mapCommonAssetConfigTransactionProperties = (transactionResult: TransactionResult): BaseAssetConfigTransaction => {
  invariant(transactionResult['asset-config-transaction'], 'asset-config-transaction is not set')
  const assetConfig = transactionResult['asset-config-transaction']

  if (!assetConfig['params']) {
    return {
      ...mapCommonTransactionProperties(transactionResult),
      type: TransactionType.AssetConfig,
      subType: AssetConfigTransactionSubType.Destroy,
      assetId: assetConfig['asset-id'],
    }
  }

  const subType = assetConfig['asset-id'] ? AssetConfigTransactionSubType.Reconfigure : AssetConfigTransactionSubType.Create
  const assetId = subType === AssetConfigTransactionSubType.Reconfigure ? assetConfig['asset-id'] : transactionResult['created-asset-index']

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.AssetConfig,
    subType: subType,
    assetId: assetId!,
    name: assetConfig['params']['name'] ?? undefined,
    url: assetConfig['params']['url'] ?? undefined,
    unitName: assetConfig['params']['unit-name'] ?? undefined,
    total: assetConfig['params']['total'] ?? undefined,
    decimals: assetConfig['params']['decimals'] ?? undefined,
    clawback: assetConfig['params']['clawback'] ?? undefined,
    manager: assetConfig['params']['manager'] ?? undefined,
    reserve: assetConfig['params']['reserve'] ?? undefined,
    freeze: assetConfig['params']['freeze'] ?? undefined,
    defaultFrozen: assetConfig['params']['default-frozen'] ?? false,
  }
}

export const asAssetConfigTransaction = (transactionResult: TransactionResult): AssetConfigTransaction => {
  return {
    id: transactionResult.id,
    ...mapCommonAssetConfigTransactionProperties(transactionResult),
  }
}

export const asInnerAssetConfigTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult
): InnerAssetConfigTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonAssetConfigTransactionProperties(transactionResult),
  }
}
