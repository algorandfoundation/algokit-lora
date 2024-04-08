import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { PaymentTransactionModel, TransactionType } from '@/features/transactions/models'
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
      amount: new AlgoAmount({ microAlgos: randomNumber() }),
      closeAmount: new AlgoAmount({ microAlgos: randomNumber() }),
      fee: new AlgoAmount({ microAlgos: randomNumber() }),
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
