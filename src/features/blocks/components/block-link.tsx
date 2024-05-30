import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  round: number
  className?: string
}>

export function BlockLink({ round, className, children }: Props) {
  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Explore.Block.ByRound}
      urlParams={{ round: round.toString() }}
    >
      {children ? children : round}
    </TemplatedNavLink>
  )
}
