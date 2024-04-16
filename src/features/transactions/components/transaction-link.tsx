import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseId } from '@/utils/ellipse-id'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  transactionId: string
  short?: boolean
}>

export function TransactionLink({ transactionId, short = false, children }: Props) {
  return (
    <TemplatedNavLink
      className={cn('text-primary underline')}
      urlTemplate={Urls.Explore.Transaction.ById}
      urlParams={{ transactionId: transactionId }}
    >
      {children ? children : short ? ellipseId(transactionId) : transactionId}
    </TemplatedNavLink>
  )
}
