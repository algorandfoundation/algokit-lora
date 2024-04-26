import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseAddress } from '@/utils/ellipse-address'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  address: string
  short?: boolean
  className?: string
}>

export function AccountLink({ address, short, className, children }: Props) {
  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Explore.Account.ById}
      urlParams={{ address }}
    >
      {children ? children : short ? ellipseAddress(address) : address}
    </TemplatedNavLink>
  )
}
