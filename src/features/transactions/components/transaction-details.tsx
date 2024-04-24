import { PaymentTransactionDetails } from './payment-transaction-details'
import { AssetTranserTransactionDetails } from './asset-transfer-transaction-details'
import { InnerTransaction, Transaction, TransactionType } from '../models'
import { AppCallTransactionDetails } from './app-call-transaction-details'
import { AssetConfigTransactionDetails } from './asset-config-transaction-details'

type Props = {
  transaction: Transaction | InnerTransaction
}

export function TransactionDetails({ transaction }: Props) {
  switch (transaction.type) {
    case TransactionType.Payment:
      return <PaymentTransactionDetails transaction={transaction} />
    case TransactionType.AssetTransfer:
      return <AssetTranserTransactionDetails transaction={transaction} />
    case TransactionType.ApplicationCall:
      return <AppCallTransactionDetails transaction={transaction} />
    case TransactionType.AssetConfig:
      return <AssetConfigTransactionDetails transaction={transaction} />
    default:
      return <></>
  }
}
