import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { PropsWithChildren } from 'react'
import { useLoadableNfd } from '@/features/nfd/data/nfd'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { is404 } from '@/utils/error'
import { accountInvalidAddressMessage } from '../pages/account-page'
import { AccountLinkInner } from './account-link-inner'

export const handle404 = (e: Error) => {
  if (is404(e)) {
    return new Error(accountInvalidAddressMessage)
  }
  throw e
}

export type AccountLinkProps = PropsWithChildren<{
  address: string
  short?: boolean
  className?: string
  showCopyButton?: boolean
}>

export const AccountLink = fixedForwardRef(({ address, ...rest }: AccountLinkProps) => {
  const [loadablenfd] = useLoadableNfd(address)

  return (
    <>
      <RenderLoadable loadable={loadablenfd} transformError={handle404} fallback={<AccountLinkInner address={address} {...rest} />}>
        {(nfd) => <AccountLinkInner address={address} nfd={nfd?.name ?? undefined} {...rest} />}
      </RenderLoadable>
    </>
  )
})
