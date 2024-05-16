import { Transaction, TransactionType } from '@/features/transactions/models'
import { ellipseAddress } from '@/utils/ellipse-address'

export const asTo = (transaction: Transaction) => {
  if (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer)
    return ellipseAddress(transaction.receiver)
  if (transaction.type === TransactionType.ApplicationCall) return transaction.applicationId
  if (transaction.type === TransactionType.AssetConfig) return transaction.assetId
  if (transaction.type === TransactionType.AssetFreeze) return ellipseAddress(transaction.address)
}
