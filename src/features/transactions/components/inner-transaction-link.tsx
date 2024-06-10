import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  transactionId: string
  innerTransactionId: string
  className?: string
}>

export function InnerTransactionLink({ transactionId, innerTransactionId, className, children }: Props) {
  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Transaction.ById.Inner.ById}
      urlParams={{
        transactionId: transactionId,
        innerTransactionId: innerTransactionId,
      }}
    >
      {children ? children : `Inner ${innerTransactionId}`}
    </TemplatedNavLink>
  )
}
