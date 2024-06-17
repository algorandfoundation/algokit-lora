import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { UrlParams } from '@/routes/urls'
import { useLoadableGroup } from '../data'
import { is404 } from '@/utils/error'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { GroupDetails } from '../components/group-details'
import { invariant } from '@/utils/invariant'
import { isInteger } from '@/utils/is-integer'
import { PageTitle } from '@/features/common/components/page-title'
import { PageLoader } from '@/features/common/components/page-loader'

export const groupPageTitle = 'Transaction Group'
export const groupNotFoundMessage = 'Transaction group not found'
export const blockInvalidRoundMessage = 'Round is invalid'
export const groupFailedToLoadMessage = 'Transaction group failed to load'

const transformError = (e: Error) => {
  if (is404(e)) {
    return new Error(groupNotFoundMessage)
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(groupFailedToLoadMessage)
}

export function GroupPage() {
  const { round: _round } = useRequiredParam(UrlParams.Round)
  invariant(isInteger(_round), blockInvalidRoundMessage)
  const { groupId } = useRequiredParam(UrlParams.GroupId)

  const round = parseInt(_round, 10)
  const loadableGroup = useLoadableGroup(groupId, round)

  return (
    <>
      <PageTitle title={groupPageTitle} />
      <RenderLoadable loadable={loadableGroup} transformError={transformError} fallback={<PageLoader />}>
        {(group) => <GroupDetails group={group} />}
      </RenderLoadable>
    </>
  )
}
