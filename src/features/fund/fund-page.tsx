import { PageTitle } from '@/features/common/components/page-title'
import { localnetId, useNetworkConfig } from '@/features/network/data'
import { LocalnetFunding } from './components/localnet-funding'
import { DispenserApiFunding } from './components/dispenser-api-funding'

export const fundPageTitle = 'Fund'
export const fundingNotAvailableMessage = 'Funding is not available on this network.'

export function FundPage() {
  const networkConfig = useNetworkConfig()

  const inner =
    networkConfig.id === localnetId ? (
      <LocalnetFunding />
    ) : networkConfig.dispenserApi ? (
      <DispenserApiFunding networkConfig={networkConfig} />
    ) : (
      'Funding is not available on this network.'
    )

  return (
    <>
      <PageTitle title={fundPageTitle} />
      {inner}
    </>
  )
}
