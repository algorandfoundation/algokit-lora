import { PageTitle } from '@/features/common/components/page-title'
import { useSelectedNetwork } from '@/features/settings/data'

export const appStudioPageTitle = 'App Studio'

const dappflowNetwork = new Map([
  ['localnet', 'sandbox'],
  ['testnet', 'algonode_testnet'],
  ['mainnet', 'algonode_mainnet'],
])

export function AppStudioPage() {
  const [selectedNetwork] = useSelectedNetwork()
  const selectedDappflowNetwork = dappflowNetwork.get(selectedNetwork) ?? dappflowNetwork.get('localnet')!
  const dappflowUrl = `https://app.dappflow.org/setnetwork?name=${selectedDappflowNetwork}&redirect=beaker-studio/`

  return (
    <>
      <PageTitle title={appStudioPageTitle} />
      <div>
        <p>
          Coming soon!
          <br />
          In the meantime, we recommend{' '}
          <a href={dappflowUrl} className="text-primary underline" rel="nofollow" target="_blank">
            Dappflow
          </a>{' '}
          for your application needs.
        </p>
      </div>
    </>
  )
}
