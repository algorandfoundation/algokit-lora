import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseId } from '@/utils/ellipse-id'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  transactionId: string
  short?: boolean
  className?: string
}>

export function TransactionLink({ transactionId, short = false, className, children }: Props) {
  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Explore.Transaction.ById}
      urlParams={{ transactionId: transactionId }}
    >
      {children ? children : short ? <abbr title={transactionId}>{ellipseId(transactionId)}</abbr> : transactionId}
    </TemplatedNavLink>
  )
}
