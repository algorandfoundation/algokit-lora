import { PageTitle } from '@/features/common/components/page-title'
import { EditAppInterface } from '../components/edit/edit-app-interface'
import { useAppInterface } from '../data'
import { invariant } from '@/utils/invariant'
import { isInteger } from '@/utils/is-integer'
import { is404, StatusError } from '@/utils/error'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { PageLoader } from '@/features/common/components/page-loader'
import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { UrlParams } from '@/routes/urls'
import { useTitle } from '@/utils/use-title'

const transformError = (e: Error) => {
  if (is404(e)) {
    const error = new Error(appInterfaceNotFoundMessage) as StatusError
    error.status = 404
    return error
  }
  // This is needed because the App interface not found doesn't return a 404 status code
  if (e.message.includes('App interface not found')) {
    const error = new Error(appInterfaceNotFoundMessage) as StatusError
    error.status = 404
    return error
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(appInterfaceFailedToLoadMessage)
}

export const editAppInterfacePageTitle = 'Edit App Interface'
export const appInterfaceNotFoundMessage = 'Application Interface not found'
export const applicationInvalidIdMessage = 'Application Id is invalid'
export const appInterfaceFailedToLoadMessage = 'Application Interface failed to load'

export function EditAppInterfacePage() {
  useTitle('Edit App Interface')
  const { applicationId: _applicationId } = useRequiredParam(UrlParams.ApplicationId)
  invariant(isInteger(_applicationId), applicationInvalidIdMessage)

  const applicationId = parseInt(_applicationId, 10)
  const [loadableAppInterface, refreshAppInterface] = useAppInterface(applicationId)

  return (
    <>
      <PageTitle title={editAppInterfacePageTitle} />
      <RenderLoadable loadable={loadableAppInterface} transformError={transformError} fallback={<PageLoader />}>
        {(appInterface) => <EditAppInterface appInterface={appInterface} refreshAppInterface={refreshAppInterface} />}
      </RenderLoadable>
    </>
  )
}
