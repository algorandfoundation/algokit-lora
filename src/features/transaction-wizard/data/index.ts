import { rawAppCallTransaction } from './app-call-transactions'
import { paymentTransaction, accountCloseTransaction } from './payment-transactions'

// TODO: NC - There may be a way to enforce this or do it differently
export const transactionTypes = {
  [paymentTransaction.type]: paymentTransaction,
  [accountCloseTransaction.type]: accountCloseTransaction,
  [rawAppCallTransaction.type]: rawAppCallTransaction,
}

export enum TransactionBuilderMode {
  Create,
  Edit,
}
