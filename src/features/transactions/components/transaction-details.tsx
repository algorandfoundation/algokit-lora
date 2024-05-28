import { PaymentTransactionDetails } from './payment-transaction-details'
import { AssetTranserTransactionDetails } from './asset-transfer-transaction-details'
import { InnerTransaction, Transaction, TransactionType } from '../models'
import { AppCallTransactionDetails } from './app-call-transaction-details'
import { AssetConfigTransactionDetails } from './asset-config-transaction-details'
import { AssetFreezeTransactionDetails } from './asset-freeze-transaction-details'
import { StateProofTransactionDetails } from './state-proof-transaction-details'
import { KeyRegTransactionDetails } from './key-reg-transaction-details'

type Props = {
  transaction: Transaction | InnerTransaction
}

export const transactionSenderLabel = 'Sender'
export const transactionReceiverLabel = 'Receiver'

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
    case TransactionType.AssetFreeze:
      return <AssetFreezeTransactionDetails transaction={transaction} />
    case TransactionType.StateProof:
      return <StateProofTransactionDetails transaction={transaction} />
    case TransactionType.KeyReg:
      return <KeyRegTransactionDetails transaction={transaction} />
    default:
      return <></>
  }
}
