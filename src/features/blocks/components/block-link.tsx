import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  round: number
}>

export function BlockLink({ round, children }: Props) {
  return (
    <TemplatedNavLink
      className={cn('text-primary underline')}
      urlTemplate={Urls.Explore.Block.ById}
      urlParams={{ round: round.toString() }}
    >
      {children ? children : round}
    </TemplatedNavLink>
  )
}
