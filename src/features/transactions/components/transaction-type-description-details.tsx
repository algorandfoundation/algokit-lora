import {
  AssetTransferTransaction,
  InnerAssetTransferTransaction,
  InnerTransaction,
  SignatureType,
  Transaction,
  TransactionType,
} from '@/features/transactions/models'
import { Badge } from '@/features/common/components/badge'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

export function TransactionTypeDescriptionDetails({ transaction }: { transaction: Transaction | InnerTransaction }) {
  const subTypeComponent = useMemo(() => {
    return transaction.type === TransactionType.AssetTransfer ? (
      <AtomSubTypeComponent transaction={transaction} />
    ) : (
      <SubTypeComponent transaction={transaction} />
    )
  }, [transaction])

  return (
    <div className="flex items-center gap-2">
      <Badge variant={transaction.type}>{transaction.type}</Badge>
      {subTypeComponent}
      {transaction.signature?.type === SignatureType.Multi && <Badge variant="outline">Multisig</Badge>}
      {transaction.signature?.type === SignatureType.Logic && <Badge variant="outline">LogicSig</Badge>}
      {transaction.rekeyTo && <Badge variant="outline">Rekey</Badge>}
    </div>
  )
}

function AtomSubTypeComponent({ transaction }: { transaction: AssetTransferTransaction | InnerAssetTransferTransaction }) {
  const subType = useAtomValue(transaction.subType)
  return subType ? <Badge variant="outline">{subType}</Badge> : null
}

function SubTypeComponent({
  transaction,
}: {
  transaction: Exclude<Transaction, AssetTransferTransaction> | Exclude<InnerTransaction, InnerAssetTransferTransaction>
}) {
  const subType = transaction.subType
  return subType ? <Badge variant="outline">{subType}</Badge> : null
}
