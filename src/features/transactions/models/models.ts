export type TransactionModel = {
  id: string
  type: TransactionType
  confirmedRound: number
  roundTime: Date
  group?: string
  fee?: MicroAlgo
  sender: string

  base64Note?: string
  textNote?: string
  messagePackNote?: string

  json: string
}

export enum TransactionType {
  Payment = 'Payment',
}

export type PaymentTransactionModel = TransactionModel & {
  type: TransactionType.Payment
  receiver: string
  amount: MicroAlgo
  closeAmount: MicroAlgo
}

export type MicroAlgo = number
