import { CopyButton } from '@/features/common/components/copy-button'
import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseId } from '@/utils/ellipse-id'
import { PropsWithChildren } from 'react'
import { useSelectedNetwork } from '@/features/network/data'

type Props = PropsWithChildren<{
  transactionId: string
  short?: boolean
  className?: string
  showCopyButton?: boolean
}>

export function asTransactionLinkTextComponent(transactionId: string, showFullTransactionId: boolean = false) {
  return showFullTransactionId ? (
    transactionId
  ) : (
    <abbr className="tracking-wide text-primary" title={transactionId}>
      {ellipseId(transactionId)}
    </abbr>
  )
}

export function TransactionLink({ transactionId, short = false, className, children, showCopyButton }: Props) {
  const [selectedNetwork] = useSelectedNetwork()

  const link = (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline inline', !children && !short && 'truncate', className)}
      urlTemplate={Urls.Explore.Transaction.ById}
      urlParams={{ transactionId: transactionId, networkId: selectedNetwork }}
    >
      {children ? children : asTransactionLinkTextComponent(transactionId, !short)}
    </TemplatedNavLink>
  )

  return children ? (
    link
  ) : (
    <div className="flex items-center">
      {link}
      {showCopyButton && <CopyButton value={transactionId} />}
    </div>
  )
}
