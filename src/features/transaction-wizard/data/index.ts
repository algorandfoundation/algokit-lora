import { paymentTransaction, accountCloseTransaction } from './payment-transactions'

// TODO: NC - There may be a way to enforce this or do it differently
export const transactionTypes = {
  [paymentTransaction.type]: paymentTransaction,
  [accountCloseTransaction.type]: accountCloseTransaction,
}
