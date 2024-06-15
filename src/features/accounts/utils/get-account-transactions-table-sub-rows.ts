import { Transaction, InnerTransaction, TransactionType } from '@/features/transactions/models'
import { flattenInnerTransactions } from '@/utils/flatten-inner-transactions'
import { Address } from '../data/types'

export const getAccountTransactionsTableSubRows = (address: Address, transaction: Transaction | InnerTransaction) => {
  if (transaction.type !== TransactionType.AppCall || transaction.innerTransactions.length === 0) {
    return []
  }

  return transaction.innerTransactions.filter((innerTransaction) => {
    const txns = flattenInnerTransactions(innerTransaction)
    return txns.some(({ transaction }) => {
      return (
        transaction.sender === address ||
        (transaction.type === TransactionType.Payment &&
          (transaction.receiver === address || transaction.closeRemainder?.to === address)) ||
        (transaction.type === TransactionType.AssetTransfer &&
          (transaction.receiver === address || transaction.closeRemainder?.to === address || transaction.clawbackFrom === address)) ||
        (transaction.type === TransactionType.AssetConfig &&
          (transaction.manager === address ||
            transaction.clawback === address ||
            transaction.reserve === address ||
            transaction.freeze === address)) ||
        (transaction.type === TransactionType.AssetFreeze && transaction.address === address)
      )
    })
  })
}
