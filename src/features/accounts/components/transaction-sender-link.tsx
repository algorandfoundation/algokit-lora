import { Nfd } from '@/features/nfd/data/types'

import { PropsWithChildren } from 'react'
import { AddressOrNfdLink } from './address-or-nfd-link'
import { Address } from '../data/types'
import { cn } from '@/features/common/utils'

export type AddressOrNfdLinkProps = PropsWithChildren<{
  address: Address
  short?: boolean
  className?: string
  showCopyButton?: boolean
  showQRButton?: boolean
  nfd?: Nfd
  autoPopulated?: boolean
}>

export default function TransactionSenderLink({
  address,
  short,

  showCopyButton,
  showQRButton,
  nfd,
  autoPopulated,
}: AddressOrNfdLinkProps) {
  return (
    <div className="flex items-center">
      <AddressOrNfdLink
        address={address}
        short={short}
        className={cn(autoPopulated && 'text-yellow-500')}
        showCopyButton={showCopyButton}
        showQRButton={showQRButton}
        nfd={nfd}
      />

      {autoPopulated && (
        <span className="group ml-1 cursor-help text-yellow-500">
          <span>?</span>
          <div className="absolute z-10 hidden rounded-sm border-2 border-gray-300/20 p-1 group-hover:block">auto populated</div>
        </span>
      )}
    </div>
  )
}
