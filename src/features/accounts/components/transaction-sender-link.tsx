import { AddressOrNfdLink, AddressOrNfdLinkProps } from './address-or-nfd-link'
import { cn } from '@/features/common/utils'

export type Props = AddressOrNfdLinkProps & { autoPopulated?: boolean }

export default function TransactionSenderLink(props: Props) {
  const { autoPopulated, className, ...rest } = props

  return (
    <div className="flex items-center">
      <AddressOrNfdLink className={cn(className, autoPopulated && 'text-yellow-500')} {...rest} />

      {autoPopulated && (
        <span className="group ml-1 cursor-help text-yellow-500">
          <span>?</span>
          <div className="absolute z-10 hidden rounded-sm border-2 border-gray-300/20 p-1 group-hover:block">auto populated</div>
        </span>
      )}
    </div>
  )
}
