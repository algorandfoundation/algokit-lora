import { cn } from '@/features/common/utils'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { useSelectedNetwork } from '@/features/settings/data'
import { NavLink } from 'react-router-dom'

type Props = PropsWithChildren<{
  transactionId: string
  innerTransactionId: string
  className?: string
}>

export function InnerTransactionLink({ transactionId, innerTransactionId, className, children }: Props) {
  const [selectedNetwork] = useSelectedNetwork()
  const url = Urls.Explore.Transaction.ById.Inner.ById.build({ networkId: selectedNetwork, transactionId }).replace('*', innerTransactionId)

  return (
    <NavLink className={cn(!children && 'text-primary underline tracking-tight', className)} to={url}>
      {children ? children : `inner/${innerTransactionId}`}
    </NavLink>
  )
}
