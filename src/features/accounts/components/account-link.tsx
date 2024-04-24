import { cn } from '@/features/common/utils'
import { ellipseAddress } from '@/utils/ellipse-address'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  address: string
  short?: boolean
  className?: string
}>

export function AccountLink({ address, short, className, children }: Props) {
  return (
    <a href="#" className={cn(!children && 'text-primary underline', className)}>
      {children ? children : short ? ellipseAddress(address) : address}
    </a>
  )
}
