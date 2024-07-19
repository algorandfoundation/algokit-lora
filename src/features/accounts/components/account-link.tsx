import { CopyButton } from '@/features/common/components/copy-button'
import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseAddress } from '@/utils/ellipse-address'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { PropsWithChildren } from 'react'
import { useSelectedNetwork } from '@/features/network/data'

type Props = PropsWithChildren<{
  address: string
  short?: boolean
  className?: string
  showCopyButton?: boolean
}>

export const AccountLink = fixedForwardRef(
  ({ address, short, className, children, showCopyButton, ...rest }: Props, ref?: React.LegacyRef<HTMLAnchorElement>) => {
    const [selectedNetwork] = useSelectedNetwork()

    return (
      <div className="flex items-center">
        <TemplatedNavLink
          className={cn(!children && 'text-primary underline', !children && !short && 'truncate', className)}
          urlTemplate={Urls.Explore.Account.ByAddress}
          urlParams={{ address, networkId: selectedNetwork }}
          ref={ref}
          {...rest}
        >
          {children ? (
            children
          ) : short ? (
            <abbr className="tracking-wide" title={address}>
              {ellipseAddress(address)}
            </abbr>
          ) : (
            address
          )}
        </TemplatedNavLink>
        {showCopyButton && <CopyButton value={address} />}
      </div>
    )
  }
)
