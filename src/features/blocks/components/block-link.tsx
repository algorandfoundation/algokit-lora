import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { useSelectedNetwork } from '@/features/network/data'
import { Round } from '../data/types'

type Props = PropsWithChildren<{
  round: Round
  className?: string
}>

export function BlockLink({ round, className, children }: Props) {
  const [selectedNetwork] = useSelectedNetwork()

  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Network.Explore.Block.ByRound}
      urlParams={{ round: round.toString(), networkId: selectedNetwork }}
    >
      {children ? children : round.toString()}
    </TemplatedNavLink>
  )
}
