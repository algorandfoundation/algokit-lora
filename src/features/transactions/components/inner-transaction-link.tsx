import { cn } from '@/features/common/utils'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { useSelectedNetwork } from '@/features/settings/data'
import { NavLink } from 'react-router-dom'

type Props = PropsWithChildren<{
  showFullTransactionId?: boolean
  networkTransactionId: string
  innerTransactionId: string
  className?: string
}>

export function InnerTransactionLink({ networkTransactionId, innerTransactionId, className, children, showFullTransactionId }: Props) {
  const [selectedNetwork] = useSelectedNetwork()
  const url = Urls.Explore.Transaction.ById.Inner.ById.build({ networkId: selectedNetwork, transactionId: networkTransactionId }).replace(
    '*',
    innerTransactionId
  )

  return (
    <NavLink className={cn(!children && 'text-primary underline tracking-tight', className)} to={url}>
      {children ? children : showFullTransactionId ? `${networkTransactionId}/inner/${innerTransactionId}` : `inner/${innerTransactionId}`}
    </NavLink>
  )
}
