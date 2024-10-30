import { useLoadableReverseLookupNfdResult } from '@/features/nfd/data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AddressOrNfdLink, AddressOrNfdLinkProps } from './address-or-nfd-link'

export type Props = Omit<AddressOrNfdLinkProps, 'nfd'>

export const AccountLink = ({ address, ...rest }: Props) => {
  const loadableNfd = useLoadableReverseLookupNfdResult(address)

  return (
    <>
      <RenderLoadable loadable={loadableNfd} fallback={<AddressOrNfdLink address={address} {...rest} />}>
        {(nfd) => <AddressOrNfdLink address={address} nfd={nfd?.name ?? undefined} {...rest} />}
      </RenderLoadable>
    </>
  )
}
