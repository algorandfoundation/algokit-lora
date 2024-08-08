import { PageTitle } from '@/features/common/components/page-title'
import { localnetId, testnetId, useSelectedNetwork } from '@/features/network/data'
import { LocalnetFunding } from './components/localnet-funding'

export const fundPageTitle = 'Fund'

export function FundPage() {
  const [selectedNetwork] = useSelectedNetwork()

  const inner =
    selectedNetwork === localnetId ? (
      <LocalnetFunding />
    ) : selectedNetwork === testnetId ? (
      'Funding is coming soon on this network.'
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
