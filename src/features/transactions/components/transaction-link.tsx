import { CopyButton } from '@/features/common/components/copy-button'
import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseId } from '@/utils/ellipse-id'
import { PropsWithChildren, useCallback } from 'react'
import { toast } from 'react-toastify'

type Props = PropsWithChildren<{
  transactionId: string
  short?: boolean
  className?: string
  supportCopy?: boolean
}>

export function TransactionLink({ transactionId, short = false, className, children, supportCopy }: Props) {
  const copyClipboard = useCallback(() => {
    navigator.clipboard.writeText(transactionId)
    toast.success('Transaction ID copied to clipboard')
  }, [transactionId])

  return (
    <div className={cn('flex gap-2 items-center')}>
      <TemplatedNavLink
        className={cn(!children && 'text-primary underline', className)}
        urlTemplate={Urls.Explore.Transaction.ById}
        urlParams={{ transactionId: transactionId }}
      >
        {children ? children : short ? <abbr title={transactionId}>{ellipseId(transactionId)}</abbr> : transactionId}
      </TemplatedNavLink>
      {supportCopy && <CopyButton onClick={copyClipboard} />}
    </div>
  )
}
