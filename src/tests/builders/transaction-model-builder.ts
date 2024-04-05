import { TransactionModel, TransactionType } from '@/features/transactions/models/models'
import { DataBuilder, dossierProxy, randomDate, randomElement, randomNumber, randomString } from '@makerx/ts-dossier'

export class TransactionModelBuilder extends DataBuilder<TransactionModel> {
  constructor() {
    const base: Omit<TransactionModel, 'json'> = {
      id: randomString(52, 52),
      sender: randomString(52, 52),
      type: randomElement([TransactionType.Payment]),
      confirmedRound: randomNumber(),
      roundTime: randomDate(),
    }

    super({
      ...base,
      json: JSON.stringify(base),
    })
  }
}

export const transactionModelBuilder = dossierProxy<TransactionModelBuilder, TransactionModel>(TransactionModelBuilder)
