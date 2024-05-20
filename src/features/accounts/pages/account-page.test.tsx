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
  accountJsonLabel,
} from '../components/labels'

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

    it('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(accountResultsAtom, new Map([[accountResult.address, atom(accountResult)]]))

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
                { term: accountAssetsHeldLabel, description: '3' },
                { term: accountAssetsCreatedLabel, description: '0' },
                { term: accountAssetsOptedInLabel, description: '3' },
                { term: accountApplicationsCreatedLabel, description: '0' },
                { term: accountApplicationsOptedInLabel, description: '2' },
              ],
            })
            const activityTabList = component.getByRole('tablist', { name: accountActivityLabel })
            expect(activityTabList).toBeTruthy()
            expect(activityTabList.children.length).toBe(6)
          })
        }
      )
    })
  })

  describe('when rendering an account', () => {
    const accountResult = accountResultMother['mainnet-JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4']().build()

    it('should be rendered with the correct json data', () => {
      const myStore = createStore()
      myStore.set(accountResultsAtom, new Map([[accountResult.address, atom(accountResult)]]))

      vi.mocked(useParams).mockImplementation(() => ({ address: accountResult.address }))

      return executeComponentTest(
        () => render(<AccountPage />, undefined, myStore),
        async (component) => {
          await waitFor(() => {
            const jsonCard = component.getByLabelText(accountJsonLabel)
            jsonCard.textContent = JSON.stringify(accountResult)
          })
        }
      )
    })
  })
})
