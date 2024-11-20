import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { CopyButton } from '@/features/common/components/copy-button'
import { cn } from '@/features/common/utils'
import { useSelectedNetwork } from '@/features/network/data'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseAddress } from '@/utils/ellipse-address'
import { Nfd } from '@/features/nfd/data/types'
import { PropsWithChildren } from 'react'

export type AddressOrNfdLinkProps = PropsWithChildren<{
  address: string
  short?: boolean
  className?: string
  showCopyButton?: boolean
  nfd?: Nfd
}>

export const AddressOrNfdLink = fixedForwardRef(
  (
    { address, nfd, short, className, children, showCopyButton, ...rest }: AddressOrNfdLinkProps,
    ref?: React.LegacyRef<HTMLAnchorElement>
  ) => {
    const [selectedNetwork] = useSelectedNetwork()

    const link = (
      <TemplatedNavLink
        className={cn(!children && 'text-primary underline', !children && 'truncate', className)}
        urlTemplate={Urls.Network.Explore.Account.ByAddress}
        urlParams={{ address, networkId: selectedNetwork }}
        ref={ref}
        {...rest}
      >
        {children ? (
          children
        ) : nfd ? (
          <abbr title={address}>{nfd}</abbr>
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
      <div className="flex items-center overflow-hidden">
        {link}
        {showCopyButton && <CopyButton value={address} />}
      </div>
    )
  }
)
