import { Round } from '@/features/blocks/data/types'
import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { GroupId } from '../data/types'
import { ellipseId } from '@/utils/ellipse-id'
import { useSelectedNetwork } from '@/features/network/data'

type Props = PropsWithChildren<{
  round: Round
  groupId: GroupId
  short?: boolean
  className?: string
}>

export function GroupLink({ round, groupId, short = false, className, children }: Props) {
  const [selectedNetwork] = useSelectedNetwork()

  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', !children && !short && 'truncate', className)}
      urlTemplate={Urls.Explore.Block.ByRound.Group.ById}
      urlParams={{ round: round.toString(), groupId: encodeURIComponent(groupId), networkId: selectedNetwork }}
    >
      {children ? (
        children
      ) : short ? (
        <abbr className="tracking-wide" title={groupId}>
          {ellipseId(groupId)}
        </abbr>
      ) : (
        groupId
      )}
    </TemplatedNavLink>
  )
}
