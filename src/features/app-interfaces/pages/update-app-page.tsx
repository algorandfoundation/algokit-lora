import { PageTitle } from '@/features/common/components/page-title'
import { cn } from '@/features/common/utils'
import { useAppInterface, useUpdateAppInterfaceStateMachine } from '../data'
import { PageLoader } from '@/features/common/components/page-loader'
import { UrlParams, Urls } from '@/routes/urls'
import { invariant } from '@/utils/invariant'
import { useTitle } from '@/utils/use-title'
import { Button } from '@/features/common/components/button'
import { ArrowLeft } from 'lucide-react'
import { useSelectedNetwork } from '@/features/network/data'
import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { isInteger } from '@/utils/is-integer'
import { appInterfaceFailedToLoadMessage, appInterfaceNotFoundMessage, applicationInvalidIdMessage, updateAppPageTitle } from './labels'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'

function UpdateAppInner({ appInterface }: { appInterface: AppInterfaceEntity }) {
  const [selectedNetwork] = useSelectedNetwork()
  const machine = useUpdateAppInterfaceStateMachine(appInterface)
  const [state] = machine

  if (state.matches('updateAppInterface')) {
    return (
      <div className={cn('relative grid grid-cols-1 lg:grid-cols-2 gap-4')}>
        Hi!
        <TemplatedNavLink
          urlTemplate={Urls.Network.AppLab.Edit.ById}
          urlParams={{ networkId: selectedNetwork, applicationId: appInterface.applicationId.toString() }}
        >
          <Button variant="outline" className="w-24" icon={<ArrowLeft size={16} />}>
            Back
          </Button>
        </TemplatedNavLink>
      </div>
    )
  }

  return <PageLoader />
}

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

export function UpdateAppPage() {
  useTitle(updateAppPageTitle)
  const { applicationId: _applicationId } = useRequiredParam(UrlParams.ApplicationId)
  invariant(isInteger(_applicationId), applicationInvalidIdMessage)

  const applicationId = BigInt(_applicationId)
  const [loadableAppInterface] = useAppInterface(applicationId)

  return (
    <>
      <PageTitle title={updateAppPageTitle} />
      <RenderLoadable loadable={loadableAppInterface} transformError={transformError} fallback={<PageLoader />}>
        {(appInterface) => <UpdateAppInner appInterface={appInterface} />}
      </RenderLoadable>
    </>
  )
}
