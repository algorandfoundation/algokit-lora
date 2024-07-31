import { PageTitle } from '@/features/common/components/page-title'
import { localnetId, useSelectedNetwork } from '@/features/network/data'
import { FundLocalnetAddressForm } from './components/fund-localnet-address-form'
import { CreateKmdDevAccountButton } from './components/create-kmd-dev-account'

export const fundPageTitle = 'Fund'

export function FundPage() {
  const [selectedNetwork] = useSelectedNetwork()

  return (
    <>
      <PageTitle title={fundPageTitle} />
      <div>
        <p>{selectedNetwork}</p>
        {selectedNetwork === localnetId && (
          <>
            <CreateKmdDevAccountButton />
            <FundLocalnetAddressForm />
          </>
        )}
      </div>
    </>
  )
}
