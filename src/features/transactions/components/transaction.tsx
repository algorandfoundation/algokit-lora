import { PaymentTransaction } from './payment-transaction'
import { AssetTranserTransaction } from './asset-transfer-transaction'
import { TransactionModel, TransactionType } from '../models'
import { AppCallTransaction } from './app-call-transaction'

type Props = {
  transaction: TransactionModel
}

export function Transaction({ transaction }: Props) {
  switch (transaction.type) {
    case TransactionType.Payment:
      return <PaymentTransaction transaction={transaction} />
    case TransactionType.AssetTransfer:
      return <AssetTranserTransaction transaction={transaction} />
    case TransactionType.ApplicationCall:
      return <AppCallTransaction transaction={transaction} />
    default:
      return <></>
  }
}
