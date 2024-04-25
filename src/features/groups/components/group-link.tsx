import { Round } from '@/features/blocks/data/types'
import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { PropsWithChildren } from 'react'
import { GroupId } from '../data/types'

type Props = PropsWithChildren<{
  round: Round
  groupId: GroupId
  className?: string
}>

export function GroupLink({ round, groupId, className, children }: Props) {
  return (
    <TemplatedNavLink
      className={cn(!children && 'text-primary underline', className)}
      urlTemplate={Urls.Explore.Block.ById.Group.ById}
      urlParams={{ round: round.toString(), groupId: encodeURIComponent(groupId) }}
    >
      {children ? children : groupId}
    </TemplatedNavLink>
  )
}
