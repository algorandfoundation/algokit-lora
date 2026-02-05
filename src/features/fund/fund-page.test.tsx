import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { fundingNotAvailableMessage, FundPage } from './fund-page'
import { mainnetId, fnetId, useSetSelectedNetwork, localnetId, testnetId, defaultNetworkConfigs } from '../network/data'
import { renderHook, render as rtlRender, screen } from '@testing-library/react'
import { fundExistingAccountAccordionLabel, fundNewAccountAccordionLabel } from './components/localnet-funding'
import { dispenserApiLoginButtonLabel } from './components/dispenser-api-logged-out'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import * as dispenserApi from './data/dispenser-api'
import { algos } from '@algorandfoundation/algokit-utils'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { DispenserApiLoggedIn } from './components/dispenser-api-logged-in'
import { TooltipProvider } from '@/features/common/components/tooltip'
import { DataProvider } from '@/features/common/components/data-provider'
import * as activeWallet from '@/features/wallet/data/active-wallet'

const renderDispenserApiLoggedInWithQueryParam = (queryParams: URLSearchParams, connectedWalletAddress?: string) => {
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

  vi.spyOn(activeWallet, 'useLoadableActiveWalletAccountSnapshotAtom').mockImplementation(() => {
    return {
      state: 'hasData',
      data: connectedWalletAddress
        ? {
            address: connectedWalletAddress,
            assetHolding: new Map(),
            algoHolding: { amount: 0n },
            minBalance: 0n,
            validAtRound: 0n,
            nfd: null,
          }
        : undefined,
    }
  })

  const urlSearchParams = queryParams.toString()
  const router = createMemoryRouter(
    [
      {
        path: '/testnet/fund',
        element: (
          <DataProvider
            networkConfig={{
              id: testnetId,
              ...defaultNetworkConfigs[testnetId],
            }}
          >
            <TooltipProvider>
              <DispenserApiLoggedIn
                networkConfig={{
                  id: testnetId,
                  ...defaultNetworkConfigs[testnetId],
                }}
              />
            </TooltipProvider>
          </DataProvider>
        ),
      },
    ],
    {
      initialEntries: [`/testnet/fund${urlSearchParams ? `?${urlSearchParams}` : ''}`],
    }
  )
  return rtlRender(<RouterProvider router={router} />)
}

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
            expect(component.getByText('Fund an existing TestNet account with ALGO')).toBeTruthy()
            expect(component.getByText('Refund unused TestNet ALGO')).toBeTruthy()
            expect(component.getByText('Fund an existing TestNet account with USDC')).toBeTruthy()
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

  describe('address query param', () => {
    const testAddress = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
    const walletAddress = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ'

    it('should populate the receiver address field when a valid address is provided in query params', async () => {
      renderDispenserApiLoggedInWithQueryParam(new URLSearchParams({ address: testAddress }))

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /receiver/i }) as HTMLInputElement
        expect(input.value).toBe(testAddress)
      })
    })

    it('should not populate the receiver address field when an invalid address is provided', async () => {
      renderDispenserApiLoggedInWithQueryParam(new URLSearchParams({ address: 'invalid-address' }))

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /receiver/i }) as HTMLInputElement
        expect(input.value).toBe('')
      })
    })

    it('should not populate the receiver address field when no address query param is provided', async () => {
      renderDispenserApiLoggedInWithQueryParam(new URLSearchParams())

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /receiver/i }) as HTMLInputElement
        expect(input.value).toBe('')
      })
    })

    it('should prioritize address from query param over connected wallet address', async () => {
      renderDispenserApiLoggedInWithQueryParam(new URLSearchParams({ address: testAddress }), walletAddress)

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /receiver/i }) as HTMLInputElement
        expect(input.value).toBe(testAddress)
      })
    })

    it('should use connected wallet address when no query param is provided', async () => {
      renderDispenserApiLoggedInWithQueryParam(new URLSearchParams(), walletAddress)

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /receiver/i }) as HTMLInputElement
        expect(input.value).toBe(walletAddress)
      })
    })
  })
})
