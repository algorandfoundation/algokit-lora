import { Badge } from '@/features/common/components/badge'
import { TransactionType } from '../models'

type Props = {
  transactionType: TransactionType
}

export function TransactionTypeBadge({ transactionType }: Props) {
  return (
    <Badge className="truncate" variant={transactionType}>
      {transactionType}
    </Badge>
  )
}
