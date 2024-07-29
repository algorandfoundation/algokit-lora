import { cn } from '@/features/common/utils'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { useSelectedNetwork } from '@/features/network/data'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link.tsx'

type Props = PropsWithChildren<{
  showFullTransactionId?: boolean
  networkTransactionId: string
  innerTransactionId: string
  className?: string
}>

export function asInnerTransactionLinkText(
  networkTransactionId: string,
  innerTransactionId: string,
  showFullTransactionId: boolean = false
) {
  return showFullTransactionId ? `${networkTransactionId}/inner/${innerTransactionId}` : `inner/${innerTransactionId}`
}

export function InnerTransactionLink({ networkTransactionId, innerTransactionId, className, children, showFullTransactionId }: Props) {
  const [selectedNetwork] = useSelectedNetwork()

  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline tracking-tight', className)}
      urlTemplate={Urls.Explore.Transaction.ById.Inner.ById}
      urlParams={{ networkId: selectedNetwork, transactionId: networkTransactionId, splat: innerTransactionId }}
    >
      {children ? children : asInnerTransactionLinkText(networkTransactionId, innerTransactionId, showFullTransactionId)}
    </TemplatedNavLink>
  )
}
