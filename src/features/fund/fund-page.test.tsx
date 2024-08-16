import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { fundingNotAvailableMessage, FundPage } from './fund-page'
import { mainnetId, fnetId, useSetSelectedNetwork, localnetId, testnetId } from '../network/data'
import { renderHook } from '@testing-library/react'
import { fundExistingAccountAccordionLabel, fundNewAccountAccordionLabel } from './components/localnet-funding'
import { dispenserApiLoginButtonLabel } from './components/dispenser-api-logged-out'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import * as dispenserApi from './data/dispenser-api'
import { algos } from '@algorandfoundation/algokit-utils'

describe('fund-page', () => {
  describe('when on localnet', () => {
    it('should render the localnet funding controls', () => {
      renderHook(async () => {
        const setSelectedNetwork = useSetSelectedNetwork()
        await setSelectedNetwork(localnetId)
      })

      return executeComponentTest(
        () => render(<FundPage />),
        async (component) => {
          await waitFor(() => {
            expect(component.getByText(fundExistingAccountAccordionLabel)).toBeTruthy()
            expect(component.getByText(fundNewAccountAccordionLabel)).toBeTruthy()
          })
        }
      )
    })
  })

  describe('when on mainnet', () => {
    it('should show message that funding is not available', () => {
      renderHook(async () => {
        const setSelectedNetwork = useSetSelectedNetwork()
        await setSelectedNetwork(mainnetId)
      })

      return executeComponentTest(
        () => render(<FundPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(fundingNotAvailableMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when on testnet', () => {
    vi.spyOn(dispenserApi, 'useDispenserApi').mockImplementation(() => {
      return {
        fundLimit: {
          state: 'hasData',
          data: algos(10),
        },
        fundAccount: vi.fn(),
        refundStatus: {
          state: 'hasData',
          data: {
            canRefund: true,
            limit: algos(10),
          },
        },
        refundDispenserAccount: vi.fn(),
      }
    })

    it('should render the dispenser api login button when logged out', () => {
      renderHook(async () => {
        const setSelectedNetwork = useSetSelectedNetwork()
        await setSelectedNetwork(testnetId)
      })

      return executeComponentTest(
        () =>
          render(
            <Auth0Provider domain="test" clientId="test">
              <FundPage />
            </Auth0Provider>
          ),
        async (component) => {
          await waitFor(() => {
            expect(component.getByText(dispenserApiLoginButtonLabel)).toBeTruthy()
          })
        }
      )
    })

    it('should render the dispenser api funding controls when logged in', () => {
      renderHook(async () => {
        const setSelectedNetwork = useSetSelectedNetwork()
        await setSelectedNetwork(testnetId)
      })

      vi.mocked(useAuth0).mockImplementation(() => {
        return {
          isAuthenticated: true,
          isLoading: false,
          getAccessTokenSilently: vi.fn(),
          loginWithRedirect: vi.fn(),
          loginWithPopup: vi.fn(),
          logout: vi.fn(),
        } as unknown as ReturnType<typeof useAuth0>
      })

      return executeComponentTest(
        () =>
          render(
            <Auth0Provider domain="test" clientId="test">
              <FundPage />
            </Auth0Provider>
          ),
        async (component) => {
          await waitFor(() => {
            expect(component.getByText('Fund an existing TestNet account')).toBeTruthy()
            expect(component.getByText('Refund unused TestNet ALGO')).toBeTruthy()
          })
        }
      )
    })
  })

  describe('when on fnet', () => {
    it('should show message that funding is not available', () => {
      renderHook(async () => {
        const setSelectedNetwork = useSetSelectedNetwork()
        await setSelectedNetwork(fnetId)
      })

      return executeComponentTest(
        () => render(<FundPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(fundingNotAvailableMessage)).toBeTruthy())
        }
      )
    })
  })
})
