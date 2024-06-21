import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { BasePaymentTransaction, InnerPaymentTransaction, PaymentTransaction, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import * as algokit from '@algorandfoundation/algokit-utils'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'

const mapCommonPaymentTransactionProperties = (transactionResult: TransactionResult) => {
  invariant(transactionResult['payment-transaction'], 'payment-transaction is not set')
  const payment = transactionResult['payment-transaction']

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.Payment,
    subType: undefined,
    receiver: payment['receiver'],
    amount: algokit.microAlgos(payment['amount']),
    closeRemainder: payment['close-remainder-to']
      ? {
          to: payment['close-remainder-to'],
          amount: algokit.microAlgos(payment['close-amount'] ?? 0),
        }
      : undefined,
  } satisfies BasePaymentTransaction
}

export const asPaymentTransaction = (transactionResult: TransactionResult): PaymentTransaction => {
  return {
    id: transactionResult.id,
    ...mapCommonPaymentTransactionProperties(transactionResult),
  }
}

export const asInnerPaymentTransaction = (
  networkTransactionId: string,
  index: string,
  transactionResult: TransactionResult
): InnerPaymentTransaction => {
  return {
    ...asInnerTransactionId(networkTransactionId, index),
    ...mapCommonPaymentTransactionProperties(transactionResult),
  }
}
