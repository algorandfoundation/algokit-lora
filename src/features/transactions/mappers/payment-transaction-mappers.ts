import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { BasePaymentTransaction, InnerPaymentTransaction, PaymentTransaction, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'
import { microAlgos } from '@algorandfoundation/algokit-utils'

const mapCommonPaymentTransactionProperties = (transactionResult: TransactionResult) => {
  invariant(transactionResult['payment-transaction'], 'payment-transaction is not set')
  const payment = transactionResult['payment-transaction']

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.Payment,
    subType: undefined,
    receiver: payment['receiver'],
    amount: microAlgos(payment['amount']),
    closeRemainder: payment['close-remainder-to']
      ? {
          to: payment['close-remainder-to'],
          amount: microAlgos(payment['close-amount'] ?? 0),
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
