import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { ellipseAddress } from '@/utils/ellipse-address'
import { fixedForwardRef } from '@/utils/fixed-forward-ref'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  address: string
  short?: boolean
  className?: string
}>

export const AccountLink = fixedForwardRef((props: Props, ref?: React.LegacyRef<HTMLAnchorElement>) => {
  const { address, short, className, children, ...rest } = props

  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Explore.Account.ById}
      urlParams={{ address }}
      ref={ref}
      {...rest}
    >
      {children ? children : short ? ellipseAddress(address) : address}
    </TemplatedNavLink>
  )
})
