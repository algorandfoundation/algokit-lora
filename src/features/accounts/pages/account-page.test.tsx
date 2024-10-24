import { executeComponentTest } from '@/tests/test-component'
import { render, renderHook, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AccountPage, accountFailedToLoadMessage } from './account-page'
import { createReadOnlyAtomAndTimestamp } from '@/features/common/data'
import { accountResultMother } from '@/tests/object-mother/account-result'
import { createStore } from 'jotai'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'
import { accountResultsAtom } from '../data'
import {
  accountAddressLabel,
  accountBalanceLabel,
  accountApplicationsCreatedLabel,
  accountAssetsCreatedLabel,
  accountAssetsHeldLabel,
  accountInformationLabel,
  accountMinBalanceLabel,
  accountApplicationsOptedInLabel,
  accountAssetsOptedInLabel,
  accountActivityLabel,
  accountRekeyedToLabel,
  accountAssetLabel,
  accountApplicationLabel,
  accountNfdLabel,
} from '../components/labels'
import { assetResultsAtom } from '@/features/assets/data'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { refreshButtonLabel } from '@/features/common/components/refresh-button'
import { algod } from '@/features/common/data/algo-client'
import { nfdResultMother } from '@/tests/object-mother/nfd-result'
import { atom } from 'jotai'
import { forwardNfdResultsAtom, reverseNfdsAtom } from '@/features/nfd/data'
import { defaultNetworkConfigs, localnetId, useSetCustomNetworkConfig } from '@/features/network/data'

vi.mock('@/features/common/data/algo-client', async () => {
  const original = await vi.importActual('@/features/common/data/algo-client')
  return {
    ...original,
    algod: {
      accountInformation: vi.fn().mockReturnValue({
        do: vi.fn().mockReturnValue({ then: vi.fn() }),
      }),
    },
  }
})

describe('account-page', () => {
  describe('when rendering an account using a invalid address', () => {
    it('should render an error message', () => {
      vi.mocked(useParams).mockReturnValue({ address: 'invalid-address' })

      return executeComponentTest(
        () => render(<AccountPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText('Address is invalid')).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering an account that failed to load', () => {
    it('should render an error message', () => {
      vi.mocked(useParams).mockReturnValue({ address: '7AHHR4ZMHKMRFUVGLU3SWGKMJBKRUA5UQQUPFWT4WMFO2RLXBUIXZR7FQQ' })
      vi.mocked(algod.accountInformation('7AHHR4ZMHKMRFUVGLU3SWGKMJBKRUA5UQQUPFWT4WMFO2RLXBUIXZR7FQQ').do).mockImplementation(() =>
        Promise.reject({})
      )

      return executeComponentTest(
        () => render(<AccountPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(accountFailedToLoadMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering an account', () => {
    const accountResult = accountResultMother['mainnet-BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA']().build()
    const assetResults = new Map([
      [924268058, createReadOnlyAtomAndTimestamp(assetResultMother['mainnet-924268058']().build())],
      [1010208883, createReadOnlyAtomAndTimestamp(assetResultMother['mainnet-1010208883']().build())],
      [1096015467, createReadOnlyAtomAndTimestamp(assetResultMother['mainnet-1096015467']().build())],
    ])

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(accountResultsAtom, new Map([[accountResult.address, createReadOnlyAtomAndTimestamp(accountResult)]]))
      myStore.set(assetResultsAtom, assetResults)

      vi.mocked(useParams).mockImplementation(() => ({ address: accountResult.address }))

      return executeComponentTest(
        () => render(<AccountPage />, undefined, myStore),
        async (component) => {
          await waitFor(() => {
            const informationCard = component.getByLabelText(accountInformationLabel)
            descriptionListAssertion({
              container: informationCard,
              items: [
                { term: accountAddressLabel, description: 'BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA' },
                { term: accountBalanceLabel, description: '5.883741' },
                { term: accountMinBalanceLabel, description: '0.7' },
                { term: accountAssetsHeldLabel, description: '1' },
                { term: accountAssetsCreatedLabel, description: '0' },
                { term: accountAssetsOptedInLabel, description: '3' },
                { term: accountApplicationsCreatedLabel, description: '0' },
                { term: accountApplicationsOptedInLabel, description: '2' },
              ],
            })
            const activityTabList = component.getByRole('tablist', { name: accountActivityLabel })
            expect(activityTabList).toBeTruthy()
            expect(activityTabList.children.length).toBe(2)

            const assetTabList = component.getByRole('tablist', { name: accountAssetLabel })
            expect(assetTabList).toBeTruthy()
            expect(assetTabList.children.length).toBe(3)

            const applicationTabList = component.getByRole('tablist', { name: accountApplicationLabel })
            expect(applicationTabList).toBeTruthy()
            expect(applicationTabList.children.length).toBe(2)
          })
        }
      )
    })
  })

  describe('when rendering an account with assets and applications', () => {
    const accountResult = accountResultMother['mainnet-ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA']().build()
    const assetResults = new Map([
      [1336655079, createReadOnlyAtomAndTimestamp(accountResult['created-assets']![0])],
      [1284444444, createReadOnlyAtomAndTimestamp(assetResultMother['mainnet-1284444444']().build())],
      [1162292622, createReadOnlyAtomAndTimestamp(assetResultMother['mainnet-1162292622']().build())],
      [1294765516, createReadOnlyAtomAndTimestamp(assetResultMother['mainnet-1294765516']().build())],
      [1355858325, createReadOnlyAtomAndTimestamp(assetResultMother['mainnet-1355858325']().build())],
      [1355898842, createReadOnlyAtomAndTimestamp(assetResultMother['mainnet-1355898842']().build())],
    ])

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(accountResultsAtom, new Map([[accountResult.address, createReadOnlyAtomAndTimestamp(accountResult)]]))
      myStore.set(assetResultsAtom, assetResults)

      vi.mocked(useParams).mockImplementation(() => ({ address: accountResult.address }))

      return executeComponentTest(
        () => render(<AccountPage />, undefined, myStore),
        async (component) => {
          await waitFor(() => {
            const informationCard = component.getByLabelText(accountInformationLabel)
            descriptionListAssertion({
              container: informationCard,
              items: [
                { term: accountAddressLabel, description: 'ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA' },
                { term: accountBalanceLabel, description: '123.714752' },
                { term: accountMinBalanceLabel, description: '5.281' },
                { term: accountAssetsHeldLabel, description: '5' },
                { term: accountAssetsCreatedLabel, description: '1' },
                { term: accountAssetsOptedInLabel, description: '6' },
                { term: accountApplicationsCreatedLabel, description: '4' },
                { term: accountApplicationsOptedInLabel, description: '1' },
              ],
            })
            const activityTabList = component.getByRole('tablist', { name: accountActivityLabel })
            expect(activityTabList).toBeTruthy()
            expect(activityTabList.children.length).toBe(2)

            const assetTabList = component.getByRole('tablist', { name: accountAssetLabel })
            expect(assetTabList).toBeTruthy()
            expect(assetTabList.children.length).toBe(3)

            const applicationTabList = component.getByRole('tablist', { name: accountApplicationLabel })
            expect(applicationTabList).toBeTruthy()
            expect(applicationTabList.children.length).toBe(2)
          })
        }
      )
    })
  })

  describe('when rendering an account with rekey', () => {
    const accountResult = accountResultMother['mainnet-DGOANM6JL4VNSBJW737T24V4WVQINFWELRE3OKHQQFZ2JFMVKUF52D4AY4']().build()

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(accountResultsAtom, new Map([[accountResult.address, createReadOnlyAtomAndTimestamp(accountResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ address: accountResult.address }))

      return executeComponentTest(
        () => render(<AccountPage />, undefined, myStore),
        async (component) => {
          await waitFor(() => {
            const informationCard = component.getByLabelText(accountInformationLabel)
            descriptionListAssertion({
              container: informationCard,
              items: [
                { term: accountAddressLabel, description: 'DGOANM6JL4VNSBJW737T24V4WVQINFWELRE3OKHQQFZ2JFMVKUF52D4AY4' },
                { term: accountBalanceLabel, description: '98.433606' },
                { term: accountMinBalanceLabel, description: '2.2285' },
                { term: accountAssetsHeldLabel, description: '0' },
                { term: accountAssetsCreatedLabel, description: '0' },
                { term: accountAssetsOptedInLabel, description: '0' },
                { term: accountApplicationsCreatedLabel, description: '0' },
                { term: accountApplicationsOptedInLabel, description: '8' },
                { term: accountRekeyedToLabel, description: 'K7F3GQNOXIMJFF2NJSBHZ7OPNWVLIJM3BN6CYAZJBY3MS6C7TN24JTYX5E' },
              ],
            })
            const activityTabList = component.getByRole('tablist', { name: accountActivityLabel })
            expect(activityTabList).toBeTruthy()
            expect(activityTabList.children.length).toBe(2)

            const assetTabList = component.getByRole('tablist', { name: accountAssetLabel })
            expect(assetTabList).toBeTruthy()
            expect(assetTabList.children.length).toBe(3)

            const applicationTabList = component.getByRole('tablist', { name: accountApplicationLabel })
            expect(applicationTabList).toBeTruthy()
            expect(applicationTabList.children.length).toBe(2)
          })
        }
      )
    })
  })

  describe('when rendering an account that becomes stale', () => {
    const accountResult = accountResultMother['mainnet-BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA']().build()
    const assetResults = new Map([
      [924268058, createReadOnlyAtomAndTimestamp(assetResultMother['mainnet-924268058']().build())],
      [1010208883, createReadOnlyAtomAndTimestamp(assetResultMother['mainnet-1010208883']().build())],
      [1096015467, createReadOnlyAtomAndTimestamp(assetResultMother['mainnet-1096015467']().build())],
    ])

    it('should be rendered with the refresh button', () => {
      const myStore = createStore()
      myStore.set(accountResultsAtom, new Map([[accountResult.address, createReadOnlyAtomAndTimestamp(accountResult)]]))
      myStore.set(assetResultsAtom, assetResults)

      vi.mocked(useParams).mockImplementation(() => ({ address: accountResult.address }))

      return executeComponentTest(
        () => render(<AccountPage />, undefined, myStore),
        async (component) => {
          await waitFor(() => {
            const informationCard = component.getByLabelText(accountInformationLabel)
            descriptionListAssertion({
              container: informationCard,
              items: [{ term: accountAddressLabel, description: 'BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA' }],
            })

            const refreshButton = component.queryByLabelText(refreshButtonLabel)
            expect(refreshButton).toBeFalsy()
          })

          // Simulate the account being evicted from the store, due to staleness
          myStore.set(accountResultsAtom, new Map())

          await waitFor(() => {
            const informationCard = component.getByLabelText(accountInformationLabel)
            descriptionListAssertion({
              container: informationCard,
              items: [{ term: accountAddressLabel, description: 'BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA' }],
            })

            const refreshButton = component.getByLabelText(refreshButtonLabel)
            expect(refreshButton).toBeTruthy()
          })
        }
      )
    })
  })

  describe('when rendering an account with a huge number of assets and falls back to excluding assets and applications', () => {
    const accountResult = accountResultMother['mainnet-X6MNR4AVJQEMJRHAPZ6F4O4SVDIYN67ZRMD2O3ULPY4QFMANQNZOEYHODE']().build()
    it('should render the account without the assets', () => {
      const myStore = createStore()
      myStore.set(accountResultsAtom, new Map([[accountResult.address, createReadOnlyAtomAndTimestamp(accountResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ address: accountResult.address }))

      return executeComponentTest(
        () => render(<AccountPage />, undefined, myStore),
        async (component) => {
          await waitFor(() => {
            const informationCard = component.getByLabelText(accountInformationLabel)
            descriptionListAssertion({
              container: informationCard,
              items: [
                { term: accountAddressLabel, description: 'X6MNR4AVJQEMJRHAPZ6F4O4SVDIYN67ZRMD2O3ULPY4QFMANQNZOEYHODE' },
                { term: accountBalanceLabel, description: '273116.395038' },
                { term: accountMinBalanceLabel, description: '98439.4' },
                { term: accountAssetsHeldLabel, description: '?' },
                { term: accountAssetsCreatedLabel, description: '984393' },
                { term: accountAssetsOptedInLabel, description: '984393' },
                { term: accountApplicationsCreatedLabel, description: '0' },
                { term: accountApplicationsOptedInLabel, description: '0' },
              ],
            })
            const activityTabList = component.getByRole('tablist', { name: accountActivityLabel })
            expect(activityTabList).toBeTruthy()
            expect(activityTabList.children.length).toBe(2)

            const assetTabList = component.getByRole('tablist', { name: accountAssetLabel })
            expect(assetTabList).toBeTruthy()
            expect(assetTabList.children.length).toBe(3)

            const applicationTabList = component.getByRole('tablist', { name: accountApplicationLabel })
            expect(applicationTabList).toBeTruthy()
            expect(applicationTabList.children.length).toBe(2)
          })
        }
      )
    })
  })

  describe('when rendering an account with an NFD', () => {
    const accountResult = accountResultMother['mainnet-DHMCHBN4W5MBO72C3L3ZP6GGJHQ4OR6SW2EP3VDEJ5VHT4MERQLCTVW6PU']().build()
    const nfdResult = nfdResultMother['mainnet-datamuseum.algo']().build()

    it('should be rendered with the correct data', async () => {
      const myStore = createStore()
      myStore.set(accountResultsAtom, new Map([[accountResult.address, createReadOnlyAtomAndTimestamp(accountResult)]]))
      myStore.set(
        reverseNfdsAtom,
        new Map([[nfdResult.depositAccount, [atom<string | Promise<string | null> | null>(nfdResult.name), Date.now()] as const]])
      )
      myStore.set(forwardNfdResultsAtom, new Map([[nfdResult.name, createReadOnlyAtomAndTimestamp(nfdResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ address: accountResult.address }))

      renderHook(async () => {
        const setCustomNetworkConfig = useSetCustomNetworkConfig()
        setCustomNetworkConfig(localnetId, {
          nfdApiUrl: 'http://not-used',
          ...defaultNetworkConfigs[localnetId],
        })
      })

      return executeComponentTest(
        () => render(<AccountPage />, undefined, myStore),
        async (component) => {
          await waitFor(() => {
            const informationCard = component.getByLabelText(accountInformationLabel)
            descriptionListAssertion({
              container: informationCard,
              items: [
                { term: accountAddressLabel, description: 'DHMCHBN4W5MBO72C3L3ZP6GGJHQ4OR6SW2EP3VDEJ5VHT4MERQLCTVW6PU' },
                { term: accountNfdLabel, description: 'datamuseum.algo' },
                { term: accountBalanceLabel, description: '1915.70635' },
                { term: accountMinBalanceLabel, description: '0.1' },
                { term: accountAssetsHeldLabel, description: '0' },
                { term: accountAssetsCreatedLabel, description: '0' },
                { term: accountAssetsOptedInLabel, description: '0' },
                { term: accountApplicationsCreatedLabel, description: '0' },
                { term: accountApplicationsOptedInLabel, description: '0' },
              ],
            })
          })
        }
      )
    })
  })
})
