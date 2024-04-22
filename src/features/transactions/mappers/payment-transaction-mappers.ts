import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { BasePaymentTransactionModel, InnerPaymentTransactionModel, PaymentTransactionModel, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import * as algokit from '@algorandfoundation/algokit-utils'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'

const mapCommonPaymentTransactionProperties = (transaction: TransactionResult) => {
  invariant(transaction['payment-transaction'], 'payment-transaction is not set')

  return {
    ...mapCommonTransactionProperties(transaction),
    type: TransactionType.Payment,
    receiver: transaction['payment-transaction']['receiver'],
    amount: algokit.microAlgos(transaction['payment-transaction']['amount']),
    closeRemainder: transaction['payment-transaction']['close-remainder-to']
      ? {
          to: transaction['payment-transaction']['close-remainder-to'],
          amount: algokit.microAlgos(transaction['payment-transaction']['close-amount'] ?? 0),
        }
      : undefined,
  } satisfies BasePaymentTransactionModel
}

export const asPaymentTransaction = (transaction: TransactionResult): PaymentTransactionModel => {
  return {
    id: transaction.id,
    ...mapCommonPaymentTransactionProperties(transaction),
  }
}

export const asInnerPaymentTransaction = (
  networkTransactionId: string,
  index: string,
  transaction: TransactionResult
): InnerPaymentTransactionModel => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonPaymentTransactionProperties(transaction),
  }
}
