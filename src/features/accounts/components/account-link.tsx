import { PropsWithChildren } from 'react'
import { useLoadableNfdResult } from '@/features/nfd/data/nfd'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { CopyButton } from '@/features/common/components/copy-button'
import { cn } from '@/features/common/utils'
import { useSelectedNetwork } from '@/features/network/data'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseAddress } from '@/utils/ellipse-address'

export type AccountLinkProps = PropsWithChildren<{
  address: string
  short?: boolean
  className?: string
  showCopyButton?: boolean
}>

export const AccountLink = ({ address, ...rest }: AccountLinkProps) => {
  const [loadableNfd] = useLoadableNfdResult(address)

  return (
    <>
      <RenderLoadable loadable={loadableNfd} fallback={<AccountLinkInner address={address} {...rest} />}>
        {(nfd) => <AccountLinkInner address={address} nfd={nfd?.name ?? undefined} {...rest} />}
      </RenderLoadable>
    </>
  )
}

type AccountLinkInnerProps = AccountLinkProps & {
  nfd?: string
}

const AccountLinkInner = fixedForwardRef(
  (
    { address, nfd, short, className, children, showCopyButton, ...rest }: AccountLinkInnerProps,
    ref?: React.LegacyRef<HTMLAnchorElement>
  ) => {
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
