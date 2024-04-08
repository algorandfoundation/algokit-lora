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

  json: string

  transactions?: TransactionModel[]
}

export enum TransactionType {
  Payment = 'Payment',
}

export type PaymentTransactionModel = CommonTransactionProperties & {
  type: TransactionType.Payment
  receiver: string
  amount: AlgoAmount
  closeAmount?: AlgoAmount
}

export type TransactionModel = PaymentTransactionModel

export type MicroAlgo = number
