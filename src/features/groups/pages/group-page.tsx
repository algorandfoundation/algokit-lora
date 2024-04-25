import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { UrlParams } from '@/routes/urls'
import { useLoadableGroup } from '../data'
import { is404 } from '@/utils/error'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { GroupDetails } from '../components/group-details'
import { cn } from '@/features/common/utils'

export const groupPageTitle = 'Group'
export const blockNotFoundMessage = 'Block not found'
export const blockInvalidRoundMessage = 'Round is invalid'
export const blockFailedToLoadMessage = 'Block failed to load'

const transformError = (e: Error) => {
  if (is404(e)) {
    return new Error(blockNotFoundMessage)
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(blockFailedToLoadMessage)
}

export function GroupPage() {
  const { round } = useRequiredParam(UrlParams.Round)
  const { groupId } = useRequiredParam(UrlParams.GroupId)
  // TODO: make sure valid round & group ID
  // After the search PR is merged

  const roundNumber = parseInt(round, 10)
  const loadableGroup = useLoadableGroup(roundNumber, groupId)

  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{groupPageTitle}</h1>
      <RenderLoadable loadable={loadableGroup} transformError={transformError}>
        {(group) => <GroupDetails group={group} />}
      </RenderLoadable>
    </div>
  )
}
