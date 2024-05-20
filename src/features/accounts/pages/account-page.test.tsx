import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AccountPage, accountFailedToLoadMessage } from './account-page'
import { algod } from '@/features/common/data'
import { accountResultMother } from '@/tests/object-mother/account-result'
import { atom, createStore } from 'jotai'
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
} from '../components/labels'
import { assetResultsAtom } from '@/features/assets/data'
import { assetResultMother } from '@/tests/object-mother/asset-result'

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

  describe('when rendering an account with applications', () => {
    const accountResult = accountResultMother['mainnet-BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA']().build()
    const assetResults = new Map([
      [924268058, atom(assetResultMother['mainnet-924268058']().build())],
      [1010208883, atom(assetResultMother['mainnet-1010208883']().build())],
      [1096015467, atom(assetResultMother['mainnet-1096015467']().build())],
    ])

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(accountResultsAtom, new Map([[accountResult.address, atom(accountResult)]]))
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
            expect(activityTabList.children.length).toBe(7)
          })
        }
      )
    })
  })

  describe('when rendering an account with assets', () => {
    const accountResult = accountResultMother['mainnet-JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4']().build()
    const assetResults = new Map([
      [1205372113, atom(accountResult['created-assets']![0])],
      [1205372555, atom(accountResult['created-assets']![1])],
      [1205372814, atom(accountResult['created-assets']![2])],
      [2254146, atom(assetResultMother['mainnet-2254146']().build())],
      [2254149, atom(assetResultMother['mainnet-2254149']().build())],
      [2254150, atom(assetResultMother['mainnet-2254150']().build())],
      [127745593, atom(assetResultMother['mainnet-127745593']().build())],
      [127746157, atom(assetResultMother['mainnet-127746157']().build())],
      [127746786, atom(assetResultMother['mainnet-127746786']().build())],
    ])

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(accountResultsAtom, new Map([[accountResult.address, atom(accountResult)]]))
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
                { term: accountAddressLabel, description: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4' },
                { term: accountBalanceLabel, description: '12016.438084' },
                { term: accountMinBalanceLabel, description: '1' },
                { term: accountAssetsHeldLabel, description: '3' },
                { term: accountAssetsCreatedLabel, description: '3' },
                { term: accountAssetsOptedInLabel, description: '9' },
                { term: accountApplicationsCreatedLabel, description: '0' },
                { term: accountApplicationsOptedInLabel, description: '0' },
              ],
            })
            const activityTabList = component.getByRole('tablist', { name: accountActivityLabel })
            expect(activityTabList).toBeTruthy()
            expect(activityTabList.children.length).toBe(7)
          })
        }
      )
    })
  })
})
