import { Round } from '@/features/blocks/data/types'
import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { GroupId } from '../data/types'
import { ellipseId } from '@/utils/ellipse-id'

type Props = PropsWithChildren<{
  round: Round
  groupId: GroupId
  short?: boolean
  className?: string
}>

export function GroupLink({ round, groupId, short = false, className, children }: Props) {
  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Explore.Block.ByRound.Group.ById}
      urlParams={{ round: round.toString(), groupId: encodeURIComponent(groupId) }}
    >
      {children ? children : short ? ellipseId(groupId) : groupId}
    </TemplatedNavLink>
  )
}
