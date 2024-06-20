import { InnerTransaction, SignatureType, Transaction } from '@/features/transactions/models'
import { useAtomValue } from 'jotai/index'
import { Badge } from '@/features/common/components/badge'

export function TransactionTypeDescriptionDetails({ transaction }: { transaction: Transaction | InnerTransaction }) {
  const subType = useAtomValue(transaction.subType)

  return (
    <div className="flex items-center gap-2">
      <Badge variant={transaction.type}>{transaction.type}</Badge>
      {subType && <Badge variant="outline">{subType}</Badge>}
      {transaction.signature?.type === SignatureType.Multi && <Badge variant="outline">Multisig</Badge>}
      {transaction.signature?.type === SignatureType.Logic && <Badge variant="outline">LogicSig</Badge>}
      {transaction.rekeyTo && <Badge variant="outline">Rekey</Badge>}
    </div>
  )
}
