import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { cn } from '@/features/common/utils'
import { isInteger } from '@/utils/is-integer'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { is404 } from '@/utils/error'
import { useLoadableApplicationBox } from '../data/application-boxes'
import { ApplicationBoxDetails } from '../components/application-box-details'

const transformError = (e: Error) => {
  if (is404(e)) {
    return new Error(applicationBoxNotFoundMessage)
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(applicationBoxFailedToLoadMessage)
}

export const applicationBoxPageTitle = 'Application Box'
export const applicationBoxNotFoundMessage = 'Application box not found'
export const applicationInvalidIdMessage = 'Application Id is invalid'
export const applicationBoxFailedToLoadMessage = 'Application box failed to load'

export function ApplicationBoxPage() {
  const { applicationId: _applicationId } = useRequiredParam(UrlParams.ApplicationId)
  const { boxName } = useRequiredParam(UrlParams.BoxName)

  invariant(isInteger(_applicationId), applicationInvalidIdMessage)
  const applicationId = parseInt(_applicationId, 10)

  const loadableApplicationBox = useLoadableApplicationBox(applicationId, boxName)

  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{applicationBoxPageTitle}</h1>
      <RenderLoadable loadable={loadableApplicationBox} transformError={transformError}>
        {(applicationBox) => <ApplicationBoxDetails applicationId={applicationId} applicationBox={applicationBox} />}
      </RenderLoadable>
    </div>
  )
}
