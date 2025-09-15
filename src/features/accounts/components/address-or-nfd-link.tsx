import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { CopyButton } from '@/features/common/components/copy-button'
import { cn } from '@/features/common/utils'
import { useSelectedNetwork } from '@/features/network/data'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseAddress } from '@/utils/ellipse-address'
import { Nfd } from '@/features/nfd/data/types'
import { PropsWithChildren } from 'react'
import { Address } from 'algosdk'
import { OpenAddressQRDialogButton } from '@/features/accounts/components/address-qr-dialog-button'

export type AddressOrNfdLinkProps = PropsWithChildren<{
  address: string | Address
  short?: boolean
  className?: string
  showCopyButton?: boolean
  showQRButton?: boolean
  nfd?: Nfd
  autoPopulated?: boolean
}>

export const AddressOrNfdLink = fixedForwardRef(
  (
    { address: _address, nfd, short, className, children, showCopyButton, showQRButton, autoPopulated, ...rest }: AddressOrNfdLinkProps,
    ref?: React.LegacyRef<HTMLAnchorElement>
  ) => {
    const [selectedNetwork] = useSelectedNetwork()
    const address = typeof _address === 'string' ? _address : _address.toString()

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
        {autoPopulated && (
          <span className="group ml-1 cursor-help text-yellow-500">
            <span>?</span>
            <div className="absolute z-10 hidden rounded-sm border-2 border-gray-300/20 p-1 group-hover:block">auto populated</div>
          </span>
        )}
        {showCopyButton && <CopyButton value={address} />}
        {showQRButton && <OpenAddressQRDialogButton address={address} />}
      </div>
    )
  }
)
