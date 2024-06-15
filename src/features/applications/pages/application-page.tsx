import { invariant } from '@/utils/invariant'
import { UrlParams } from '../../../routes/urls'
import { useRequiredParam } from '../../common/hooks/use-required-param'
import { isInteger } from '@/utils/is-integer'
import { useLoadableApplication } from '../data'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { ApplicationDetails } from '../components/application-details'
import { is404 } from '@/utils/error'
import { useCallback } from 'react'
import { PageTitle } from '@/features/common/components/page-title'
import { PageLoader } from '@/features/common/components/page-loader'

const transformError = (e: Error) => {
  if (is404(e)) {
    return new Error(applicationNotFoundMessage)
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(applicationFailedToLoadMessage)
}

export const applicationPageTitle = 'Application'
export const applicationNotFoundMessage = 'Application not found'
export const applicationInvalidIdMessage = 'Application Id is invalid'
export const applicationFailedToLoadMessage = 'Application failed to load'

export function ApplicationPage() {
  const { applicationId: _applicationId } = useRequiredParam(UrlParams.ApplicationId)
  invariant(isInteger(_applicationId), applicationInvalidIdMessage)

  const applicationId = parseInt(_applicationId, 10)
  const [loadableApplication, refreshApplication, isStale] = useLoadableApplication(applicationId)

  const refresh = useCallback(() => {
    refreshApplication()
  }, [refreshApplication])

  return (
    <>
      <PageTitle title={applicationPageTitle} canRefreshPage={isStale} onRefresh={refresh} />
      <RenderLoadable loadable={loadableApplication} transformError={transformError} fallback={<PageLoader />}>
        {(application) => <ApplicationDetails application={application} />}
      </RenderLoadable>
    </>
  )
}
