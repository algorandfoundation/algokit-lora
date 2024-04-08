import { paymentTransactionModelBuilder } from '../builders/transaction-model-builder'

export const transactionModelMother = {
  paymentTransaction: () => {
    return paymentTransactionModelBuilder()
  },
}
