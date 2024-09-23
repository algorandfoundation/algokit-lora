import algosdk from 'algosdk'
import {
  BuildTransactionResult,
  BuildAppCallTransactionResult,
  BuildableTransactionType,
  BuildPaymentTransactionResult,
} from '@/features/transaction-wizard/models'
import { invariant } from '@/utils/invariant'
import { algos } from '@algorandfoundation/algokit-utils'
import { algorandClient } from '@/features/common/data/algo-client'

export const asAlgosdkTransactions = async (transaction: BuildTransactionResult): Promise<algosdk.Transaction[]> => {
  if (transaction.type === BuildableTransactionType.Payment) {
    return [await asPaymentTransaction(transaction)]
  }
  if (transaction.type === BuildableTransactionType.AppCall && transaction.method) {
    return await asMethodCallTransaction(transaction)
  }
  throw new Error('Unsupported transaction type')
}

const asPaymentTransaction = async (transaction: BuildPaymentTransactionResult): Promise<algosdk.Transaction> => {
  return await algorandClient.transactions.payment({
    sender: transaction.sender,
    receiver: transaction.receiver,
    amount: algos(transaction.amount),
    note: transaction.note,
    ...(!transaction.fee.setAutomatically && transaction.fee.value ? { staticFee: algos(transaction.fee.value) } : undefined),
    ...(!transaction.validRounds.setAutomatically && transaction.validRounds.firstValid && transaction.validRounds.lastValid
      ? {
          firstValidRound: transaction.validRounds.firstValid,
          lastValidRound: transaction.validRounds.lastValid,
        }
      : undefined),
  })
}

const asMethodCallTransaction = async (transaction: BuildAppCallTransactionResult): Promise<algosdk.Transaction[]> => {
  invariant(transaction.method, 'Method is required')
  invariant(transaction.methodArgs, 'Method args are required')

  const args = await Promise.all(
    transaction.methodArgs.map(async (arg) => {
      if (typeof arg === 'object') {
        return (await asAlgosdkTransactions(arg as BuildTransactionResult))[0]
      }
      return arg
    })
  )
  const result = await algorandClient.transactions.appCallMethodCall({
    sender: transaction.sender,
    appId: BigInt(transaction.applicationId), // TODO: PD - handle bigint
    method: transaction.method,
    args: args,
    note: transaction.note,
    ...(!transaction.fee.setAutomatically && transaction.fee.value ? { staticFee: algos(transaction.fee.value) } : undefined),
    ...(!transaction.validRounds.setAutomatically && transaction.validRounds.firstValid && transaction.validRounds.lastValid
      ? {
          firstValidRound: transaction.validRounds.firstValid,
          lastValidRound: transaction.validRounds.lastValid,
        }
      : undefined),
  })

  return result.transactions
}
