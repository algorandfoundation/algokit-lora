import { Badge } from '@/features/common/components/badge'
import { TransactionType } from '../models'

type Props = {
  transactionType: TransactionType
}

export function TransactionTypeBadge({ transactionType }: Props) {
  return (
    <Badge className="ml-auto truncate" variant={transactionType}>
      {transactionType}
    </Badge>
  )
}
