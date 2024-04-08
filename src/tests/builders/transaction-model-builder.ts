import { PaymentTransactionModel, TransactionType } from '@/features/transactions/models/models'
import { DataBuilder, dossierProxy, randomNumber, randomString } from '@makerx/ts-dossier'

export class PaymentTransactionModelBuilder extends DataBuilder<PaymentTransactionModel> {
  constructor() {
    const base: Omit<PaymentTransactionModel, 'json'> = {
      id: randomString(52, 52),
      sender: randomString(52, 52),
      type: TransactionType.Payment,
      confirmedRound: randomNumber(),
      roundTime: randomNumber(),
      receiver: randomString(52, 52),
      amount: randomNumber(),
      closeAmount: randomNumber(),
    }

    super({
      ...base,
      json: JSON.stringify(base),
    })
  }
}

export const paymentTransactionModelBuilder = dossierProxy<PaymentTransactionModelBuilder, PaymentTransactionModel>(
  PaymentTransactionModelBuilder
)
