import { PropsWithChildren } from 'react'
import { useLoadableReverseLookupNfdResult } from '@/features/nfd/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { CopyButton } from '@/features/common/components/copy-button'
import { cn } from '@/features/common/utils'
import { useSelectedNetwork } from '@/features/network/data'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseAddress } from '@/utils/ellipse-address'
import { Nfd } from '@/features/nfd/data/types'

export type Props = PropsWithChildren<{
  address: string
  short?: boolean
  className?: string
  showCopyButton?: boolean
}>

export const AccountLink = ({ address, ...rest }: Props) => {
  const loadableNfd = useLoadableReverseLookupNfdResult(address)

  return (
    <>
      <RenderLoadable loadable={loadableNfd} fallback={<AccountLinkInner address={address} {...rest} />}>
        {(nfd) => <AccountLinkInner address={address} nfd={nfd?.name ?? undefined} {...rest} />}
      </RenderLoadable>
    </>
  )
}

type AccountLinkInnerProps = Props & {
  nfd?: Nfd
}

const AccountLinkInner = fixedForwardRef(
  (
    { address, nfd, short, className, children, showCopyButton, ...rest }: AccountLinkInnerProps,
    ref?: React.LegacyRef<HTMLAnchorElement>
  ) => {
    const [selectedNetwork] = useSelectedNetwork()

    const link = (
      <TemplatedNavLink
        className={cn(!children && 'text-primary underline', !children && 'truncate', className)}
        urlTemplate={Urls.Explore.Account.ByAddress}
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
