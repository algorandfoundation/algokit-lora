import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AccountPage, accountFailedToLoadMessage } from './account-page'
import { algod } from '@/features/common/data'
import { accountResultMother } from '@/tests/object-mother/account-result'
import { createStore } from 'jotai'
import { accountResultsAtom } from '../data/core'
import {
  accountAddressLabel,
  accountBalanceLabel,
  accountCreatedApplicationsLabel,
  accountCreatedAssetsLabel,
  accountHoldingAssetsLabel,
  accountInformationLabel,
  accountMinBalanceLabel,
  accountOptedApplicationsLabel,
} from '../components/account-info'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'

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

    it.skip('should be rendered with the correct data', () => {
      const myStore = createStore()
      myStore.set(accountResultsAtom, new Map([[accountResult.index, accountResult]]))

      vi.mocked(useParams).mockImplementation(() => ({ address: accountResult.address }))
      // vi.mocked(algod.accountInformation('7AHHR4ZMHKMRFUVGLU3SWGKMJBKRUA5UQQUPFWT4WMFO2RLXBUIXZR7FQQ').do).mockImplementation(() =>
      //   Promise.resolve({})
      // )

      return executeComponentTest(
        () => render(<AccountPage />, undefined, myStore),
        async (component) => {
          await waitFor(() => {
            const informationCard = component.getByLabelText(accountInformationLabel)
            descriptionListAssertion({
              container: informationCard,
              items: [
                { term: accountAddressLabel, description: '7AHHR4ZMHKMRFUVGLU3SWGKMJBKRUA5UQQUPFWT4WMFO2RLXBUIXZR7FQQ' },
                { term: accountBalanceLabel, description: '5854460' },
                { term: accountMinBalanceLabel, description: '200000' },
                { term: accountHoldingAssetsLabel, description: '1' },
                { term: accountCreatedAssetsLabel, description: '0' },
                { term: accountCreatedApplicationsLabel, description: '0' },
                { term: accountOptedApplicationsLabel, description: '0' },
              ],
            })
          })
        }
      )
    })
  })
})
