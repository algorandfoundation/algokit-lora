type CommonTransactionProperties = {
  id: string
  type: TransactionType
  confirmedRound: number
  roundTime: number
  group?: string
  fee?: MicroAlgo
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
  amount: MicroAlgo
  closeAmount: MicroAlgo
}

export type TransactionModel = PaymentTransactionModel

export type MicroAlgo = number
