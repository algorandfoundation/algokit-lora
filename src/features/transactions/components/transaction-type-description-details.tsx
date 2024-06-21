import { InnerTransaction, SignatureType, Transaction } from '@/features/transactions/models'
import { Badge } from '@/features/common/components/badge'
import { Atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'

export function TransactionTypeDescriptionDetails({ transaction }: { transaction: Transaction | InnerTransaction }) {
  const subTypeComponent = useMemo(() => {
    return typeof transaction.subType === 'object' ? (
      <AtomSubTypeComponent subType={transaction.subType} />
    ) : (
      <SubTypeComponent subType={transaction.subType} />
    )
  }, [transaction.subType])

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

function AtomSubTypeComponent({ subType: _subType }: { subType: Atom<string | undefined> }) {
  const subType = useAtomValue(_subType)
  return subType ? <Badge variant="outline">{subType}</Badge> : null
}

function SubTypeComponent({ subType }: { subType: string | undefined }) {
  return subType ? <Badge variant="outline">{subType}</Badge> : null
}
