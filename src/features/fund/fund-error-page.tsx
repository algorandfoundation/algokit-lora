import { asError } from '@/utils/error'
import { useRouteError } from 'react-router-dom'
import { PageTitle } from '../common/components/page-title'
import { fundPageTitle } from './fund-page'
import { useNetworkConfig } from '../network/data'
import { DispenserApiUserInfo } from './components/dispenser-api-user-info'

export function FundErrorPage() {
  const error = asError(useRouteError())
  const networkConfig = useNetworkConfig()

  return (
    <>
      <PageTitle title={fundPageTitle} />
      <div>
        {networkConfig.dispenserApi && <DispenserApiUserInfo />}
        <p>Error: {error.message}</p>
      </div>
    </>
  )
}
