import { PropsWithChildren } from 'react'
import { useLoadableNfd } from '@/features/nfd/data/nfd'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { is404 } from '@/utils/error'
import { AccountLinkInner } from './account-link-inner'

const nfdInvalidAddressMessage = 'Invalid nfd address'
const nfdFailedToLoadMessage = 'Nfd failed to load'

export const transformError = (e: Error) => {
  if (is404(e)) {
    return new Error(nfdInvalidAddressMessage)
  }
  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(nfdFailedToLoadMessage)
}

export type AccountLinkProps = PropsWithChildren<{
  address: string
  short?: boolean
  className?: string
  showCopyButton?: boolean
}>

export const AccountLink = ({ address, ...rest }: AccountLinkProps) => {
  const [loadablenfd] = useLoadableNfd(address)

  return (
    <>
      <RenderLoadable loadable={loadablenfd} transformError={transformError} fallback={<AccountLinkInner address={address} {...rest} />}>
        {(nfd) => <AccountLinkInner address={address} nfd={nfd?.name ?? undefined} {...rest} />}
      </RenderLoadable>
    </>
  )
}
