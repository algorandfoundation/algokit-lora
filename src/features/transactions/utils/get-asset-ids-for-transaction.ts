import algosdk from 'algosdk'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { invariant } from '@/utils/invariant'
import { AssetId } from '@/features/assets/data/types'

export const getAssetIdsForTransaction = (transaction: TransactionResult): AssetId[] => {
  if (transaction['tx-type'] === algosdk.TransactionType.axfer) {
    invariant(transaction['asset-transfer-transaction'], 'asset-transfer-transaction is not set')

    return [transaction['asset-transfer-transaction']['asset-id']]
  }
  if (transaction['tx-type'] === algosdk.TransactionType.appl) {
    invariant(transaction['application-transaction'], 'application-transaction is not set')

    const innerTransactions = transaction['inner-txns'] ?? []
    return innerTransactions.reduce((acc, innerTxn) => {
      const innerResult = getAssetIdsForTransaction(innerTxn)
      return acc.concat(innerResult)
    }, [] as number[])
  }
  if (transaction['tx-type'] === algosdk.TransactionType.acfg) {
    invariant(transaction['asset-config-transaction'], 'asset-config-transaction is not set')

    return [transaction['asset-config-transaction']['asset-id'] ?? transaction['created-asset-index']]
  }
  if (transaction['tx-type'] === algosdk.TransactionType.afrz) {
    invariant(transaction['asset-freeze-transaction'], 'asset-freeze-transaction is not set')

    return [transaction['asset-freeze-transaction']['asset-id']]
  }

  return []
}
