import { PaymentTransaction } from './payment-transaction'
import { AssetTranserTransaction } from './asset-transfer-transaction'
import { TransactionModel, TransactionType } from '../models'

type Props = {
  transaction: TransactionModel
}

export function Transaction({ transaction }: Props) {
  switch (transaction.type) {
    case TransactionType.Payment:
      return <PaymentTransaction transaction={transaction} />
    case TransactionType.AssetTransfer:
      return <AssetTranserTransaction transaction={transaction} />
    default:
      return <></>
  }
}
