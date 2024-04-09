import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

type Address = string

type CommonTransactionProperties = {
  id: string
  type: TransactionType
  confirmedRound: number
  roundTime: number
  group?: string
  fee: AlgoAmount
  sender: Address

  base64Note?: string
  textNote?: string
  messagePackNote?: string

  transactions?: TransactionModel[]

  multiSig?: MultiSigModel
}

export enum TransactionType {
  Payment = 'Payment',
}

export type PaymentTransactionModel = CommonTransactionProperties & {
  type: TransactionType.Payment
  receiver: Address
  amount: AlgoAmount
  closeAmount?: AlgoAmount
}

export type TransactionModel = PaymentTransactionModel

export type MicroAlgo = number

export type MultiSigModel = {
  version: number
  threshold: number
  subsigners: Address[]
}
