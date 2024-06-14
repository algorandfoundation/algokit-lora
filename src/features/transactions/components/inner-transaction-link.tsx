import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { useSelectedNetwork } from '@/features/settings/data'

type Props = PropsWithChildren<{
  transactionId: string
  innerTransactionId: string
  className?: string
}>

export function InnerTransactionLink({ transactionId, innerTransactionId, className, children }: Props) {
  const [selectedNetwork] = useSelectedNetwork()

  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Explore.Transaction.ById.Inner.ById}
      urlParams={{
        networkId: selectedNetwork,
        transactionId: transactionId,
        innerTransactionId: innerTransactionId,
      }}
    >
      {children ? children : `Inner ${innerTransactionId}`}
    </TemplatedNavLink>
  )
}
