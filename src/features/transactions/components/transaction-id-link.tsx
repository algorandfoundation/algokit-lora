import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseId } from '@/utils/ellipse-id'

type Props = {
  transactionId: string
  short?: boolean
}

export function TransactionIdLink({ transactionId, short = false }: Props) {
  return (
    <TemplatedNavLink urlTemplate={Urls.Explore.Transaction.ById} urlParams={{ transactionId: transactionId }}>
      {short ? ellipseId(transactionId) : transactionId}
    </TemplatedNavLink>
  )
}
