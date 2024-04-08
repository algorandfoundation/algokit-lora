import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

export type TransactionModel = {
  id: string
  type: TransactionType
  confirmedRound: number
  roundTime: Date
  group?: string
  fee: AlgoAmount
  sender: string

  base64Note?: string
  textNote?: string
  messagePackNote?: string
}

export enum TransactionType {
  Payment = 'Payment',
}

export type PaymentTransactionModel = TransactionModel & {
  type: TransactionType.Payment
  receiver: string
  amount: AlgoAmount
  closeAmount?: AlgoAmount
}
