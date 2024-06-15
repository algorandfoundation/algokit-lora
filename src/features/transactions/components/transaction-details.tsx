import { PaymentTransactionDetails } from './payment-transaction-details'
import { AssetTransferTransactionDetails } from './asset-transfer-transaction-details'
import { InnerTransaction, Transaction, TransactionType } from '../models'
import { AppCallTransactionDetails } from './app-call-transaction-details'
import { AssetConfigTransactionDetails } from './asset-config-transaction-details'
import { AssetFreezeTransactionDetails } from './asset-freeze-transaction-details'
import { StateProofTransactionDetails } from './state-proof-transaction-details'
import { KeyRegTransactionDetails } from './key-reg-transaction-details'
import { TransactionInfo } from './transaction-info'

type Props = {
  transaction: Transaction | InnerTransaction
}

export function TransactionDetails({ transaction }: Props) {
  return (
    <div className="space-y-4">
      <TransactionInfo transaction={transaction} />
      {transaction.type === TransactionType.Payment ? (
        <PaymentTransactionDetails transaction={transaction} />
      ) : transaction.type === TransactionType.AssetTransfer ? (
        <AssetTransferTransactionDetails transaction={transaction} />
      ) : transaction.type === TransactionType.AppCall ? (
        <AppCallTransactionDetails transaction={transaction} />
      ) : transaction.type === TransactionType.AssetConfig ? (
        <AssetConfigTransactionDetails transaction={transaction} />
      ) : transaction.type === TransactionType.AssetFreeze ? (
        <AssetFreezeTransactionDetails transaction={transaction} />
      ) : transaction.type === TransactionType.StateProof ? (
        <StateProofTransactionDetails transaction={transaction} />
      ) : transaction.type === TransactionType.KeyReg ? (
        <KeyRegTransactionDetails transaction={transaction} />
      ) : undefined}
    </div>
  )
}
