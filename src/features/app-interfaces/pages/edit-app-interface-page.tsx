import { PageTitle } from '@/features/common/components/page-title'
import { EditAppInterface } from '../components/edit/edit-app-interface'
import { useAppInterface } from '../data'
import { invariant } from '@/utils/invariant'
import { isInteger } from '@/utils/is-integer'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { PageLoader } from '@/features/common/components/page-loader'
import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { UrlParams } from '@/routes/urls'
import { useTitle } from '@/utils/use-title'
import {
  appInterfaceFailedToLoadMessage,
  appInterfaceNotFoundMessage,
  applicationInvalidIdMessage,
  editAppInterfacePageTitle,
} from './labels'

const transformError = (e: Error & { status?: number }) => {
  // This is needed because the App interface not found doesn't return a 404 status code
  if (e.message.includes(appInterfaceNotFoundMessage)) {
    e.message = appInterfaceNotFoundMessage
    e.status = 404
    return e
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(appInterfaceFailedToLoadMessage)
}

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
