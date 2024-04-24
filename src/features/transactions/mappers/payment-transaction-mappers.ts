import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { BasePaymentTransaction, InnerPaymentTransaction, PaymentTransaction, TransactionType } from '../models'
import { invariant } from '@/utils/invariant'
import * as algokit from '@algorandfoundation/algokit-utils'
import { asInnerTransactionId, mapCommonTransactionProperties } from './transaction-common-properties-mappers'

const mapCommonPaymentTransactionProperties = (transactionResult: TransactionResult) => {
  invariant(transactionResult['payment-transaction'], 'payment-transaction is not set')

  return {
    ...mapCommonTransactionProperties(transactionResult),
    type: TransactionType.Payment,
    receiver: transactionResult['payment-transaction']['receiver'],
    amount: algokit.microAlgos(transactionResult['payment-transaction']['amount']),
    closeRemainder: transactionResult['payment-transaction']['close-remainder-to']
      ? {
          to: transactionResult['payment-transaction']['close-remainder-to'],
          amount: algokit.microAlgos(transactionResult['payment-transaction']['close-amount'] ?? 0),
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
