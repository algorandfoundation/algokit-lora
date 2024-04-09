import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

type CommonTransactionProperties = {
  id: string
  type: TransactionType
  confirmedRound: number
  roundTime: number
  group?: string
  fee: AlgoAmount
  sender: string

  base64Note?: string
  textNote?: string
  messagePackNote?: string

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

export enum SignatureType {
  singleSig = 'singlesig',
  multiSig = 'multiSig',
  logicSig = 'logicSig',
}

export type MultiSigModel = {
  type: SignatureType.multiSig
  version: number
  threshold: number
  subsignatures: string[]
}
