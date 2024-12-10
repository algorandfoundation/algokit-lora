import algosdk from 'algosdk'
import { TransactionResult } from '@/features/transactions/data/types'
import { invariant } from '@/utils/invariant'
import { AssetId } from '@/features/assets/data/types'

export const getAssetIdsForTransaction = (transaction: TransactionResult): AssetId[] => {
  if (transaction.txType === algosdk.TransactionType.axfer) {
    invariant(transaction.assetTransferTransaction, 'asset-transfer-transaction is not set')

    return [transaction.assetTransferTransaction.assetId]
  }
  if (transaction.txType === algosdk.TransactionType.appl) {
    invariant(transaction.applicationTransaction, 'application-transaction is not set')

    const innerTransactions = transaction.innerTxns ?? []
    return innerTransactions.reduce((acc, innerTxn) => {
      const innerResult = getAssetIdsForTransaction(innerTxn)
      return acc.concat(innerResult)
    }, [] as bigint[])
  }
  if (transaction.txType === algosdk.TransactionType.acfg) {
    invariant(transaction.assetConfigTransaction, 'asset-config-transaction is not set')
    const assetId = transaction.assetConfigTransaction.assetId ?? transaction.createdAssetIndex
    invariant(assetId != null, 'asset-id is not set')
    return [assetId]
  }
  if (transaction.txType === algosdk.TransactionType.afrz) {
    invariant(transaction.assetFreezeTransaction, 'asset-freeze-transaction is not set')

    return [transaction.assetFreezeTransaction.assetId]
  }

  return []
}
