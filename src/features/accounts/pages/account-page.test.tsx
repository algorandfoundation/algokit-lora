import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AccountPage, accountFailedToLoadMessage } from './account-page'
import { algod } from '@/features/common/data'
import { accountResultMother } from '@/tests/object-mother/account-result'
import { atom, createStore } from 'jotai'
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
} from '../components/account-info'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'
import { accountResultsAtom } from '../data'

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
    const accountResult = accountResultMother['mainnet-7AHHR4ZMHKMRFUVGLU3SWGKMJBKRUA5UQQUPFWT4WMFO2RLXBUIXZR7FQQ']().build()

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
                { term: accountAddressLabel, description: '7AHHR4ZMHKMRFUVGLU3SWGKMJBKRUA5UQQUPFWT4WMFO2RLXBUIXZR7FQQ' },
                { term: accountBalanceLabel, description: '5.85446' },
                { term: accountMinBalanceLabel, description: '0.2' },
                { term: accountAssetsHeldLabel, description: '1' },
                { term: accountAssetsCreatedLabel, description: '0' },
                { term: accountAssetsOptedInLabel, description: '1' },
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
