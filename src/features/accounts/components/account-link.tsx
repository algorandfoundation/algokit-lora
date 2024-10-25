import { PropsWithChildren } from 'react'
import { useLoadableReverseLookupNfdResult } from '@/features/nfd/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AccountLinkWithNfd } from './account-link-with-nfd'

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
      <RenderLoadable loadable={loadableNfd} fallback={<AccountLinkWithNfd address={address} {...rest} />}>
        {(nfd) => <AccountLinkWithNfd address={address} nfd={nfd?.name ?? undefined} {...rest} />}
      </RenderLoadable>
    </>
  )
}
