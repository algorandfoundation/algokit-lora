import { CopyButton } from '@/features/common/components/copy-button'
import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseId } from '@/utils/ellipse-id'
import { PropsWithChildren } from 'react'
import { useSelectedNetwork } from '@/features/settings/data'

type Props = PropsWithChildren<{
  transactionId: string
  short?: boolean
  className?: string
  showCopyButton?: boolean
}>

export function TransactionLink({ transactionId, short = false, className, children, showCopyButton }: Props) {
  const [selectedNetwork] = useSelectedNetwork()

  return (
    <div className="flex items-center">
      <TemplatedNavLink
        className={cn(!children && 'text-primary underline inline', className)}
        urlTemplate={Urls.Explore.Transaction.ById}
        urlParams={{ transactionId: transactionId, networkId: selectedNetwork }}
      >
        {children ? children : short ? <abbr title={transactionId}>{ellipseId(transactionId)}</abbr> : transactionId}
      </TemplatedNavLink>
      {showCopyButton && <CopyButton value={transactionId} />}
    </div>
  )
}
