import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { cn } from '@/features/common/utils'
import { isInteger } from '@/utils/is-integer'

export const applicationPageTitle = 'Application'
export const applicationInvalidIdMessage = 'Application Id is invalid'

export function ApplicationPage() {
  const { applicationId } = useRequiredParam(UrlParams.ApplicationId)
  invariant(isInteger(applicationId), applicationInvalidIdMessage)

  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{applicationPageTitle}</h1>
      {applicationId}
    </div>
  )
}
