import { CopyButton } from '@/features/common/components/copy-button'
import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseAddress } from '@/utils/ellipse-address'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { PropsWithChildren, useCallback } from 'react'
import { toast } from 'react-toastify'

type Props = PropsWithChildren<{
  address: string
  short?: boolean
  className?: string
  showCopyButton?: boolean
}>

export const AccountLink = fixedForwardRef(
  ({ address, short, className, children, showCopyButton, ...rest }: Props, ref?: React.LegacyRef<HTMLAnchorElement>) => {
    const copyClipboard = useCallback(async () => {
      await navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard')
    }, [address])
    return (
      <div className={cn('inline-flex gap-2 items-center')}>
        <TemplatedNavLink
          className={cn(!children && 'text-primary underline', className)}
          urlTemplate={Urls.Account.ByAddress}
          urlParams={{ address }}
          ref={ref}
          {...rest}
        >
          {children ? children : short ? <abbr title={address}>{ellipseAddress(address)}</abbr> : address}
        </TemplatedNavLink>
        {showCopyButton && <CopyButton onClick={copyClipboard} />}
      </div>
    )
  }
)
