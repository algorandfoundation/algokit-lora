import { CopyButton } from '@/features/common/components/copy-button'
import { cn } from '@/features/common/utils'
import { useSelectedNetwork } from '@/features/network/data'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseAddress } from '@/utils/ellipse-address'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { AccountLinkProps } from './account-link'

type Props = AccountLinkProps & {
  nfd?: string
}

export const AccountLinkInner = fixedForwardRef(
  ({ address, nfd, short, className, children, showCopyButton, ...rest }: Props, ref?: React.LegacyRef<HTMLAnchorElement>) => {
    const [selectedNetwork] = useSelectedNetwork()

    const link = (
      <TemplatedNavLink
        className={cn(!children && 'text-primary underline', !children && !short && 'truncate', className)}
        urlTemplate={Urls.Explore.Account.ByAddress}
        urlParams={{ address, networkId: selectedNetwork }}
        ref={ref}
        {...rest}
      >
        {children ? (
          children
        ) : nfd ? (
          <abbr className="tracking-wide" title={address}>
            {nfd}
          </abbr>
        ) : short ? (
          <abbr className="tracking-wide" title={address}>
            {ellipseAddress(address)}
          </abbr>
        ) : (
          address
        )}
      </TemplatedNavLink>
    )

    return children ? (
      link
    ) : (
      <div className="flex items-center">
        {link}
        {showCopyButton && <CopyButton value={address} />}
      </div>
    )
  }
)
