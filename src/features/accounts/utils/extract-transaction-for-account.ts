import { Transaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { Address } from '../data/types'

export const extractTransactionsForAccount = (transaction: Transaction, address: Address) => {
  const flattenedTransactions = flattenInnerTransactions(transaction)
  const results = []

  for (const { transaction } of flattenedTransactions) {
    if (flattenedTransactions.length === 1) {
      results.push(transaction)
    } else {
      if (transaction.sender === address) {
        results.push(transaction)
      } else if (
        (transaction.type === TransactionType.Payment || transaction.type === TransactionType.AssetTransfer) &&
        (transaction.receiver === address || transaction.closeRemainder?.to === address)
      ) {
        results.push(transaction)
      } else if (
        transaction.type === TransactionType.AssetConfig &&
        (transaction.manager === address ||
          transaction.clawback === address ||
          transaction.reserve === address ||
          transaction.freeze === address)
      ) {
        results.push(transaction)
      } else if (transaction.type === TransactionType.AssetTransfer && transaction.clawbackFrom === address) {
        results.push(transaction)
      } else if (transaction.type === TransactionType.AssetFreeze && transaction.address === address) {
        results.push(transaction)
      }
    }
  }
  return results
}
