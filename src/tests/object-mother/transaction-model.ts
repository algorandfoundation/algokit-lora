import { TransactionType } from '@/features/transactions/models/models'
import { transactionModelBuilder } from '../builders/transaction-model-builder'

export const transactionModelMother = {
  randomTransaction: () => {
    return transactionModelBuilder()
  },
  paymentTransaction: () => {
    return transactionModelBuilder().withType(TransactionType.Payment)
  },
}
