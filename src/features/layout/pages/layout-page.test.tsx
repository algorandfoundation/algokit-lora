import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { LayoutPage } from '@/features/layout/pages/layout-page'
import { connectWalletLabel } from '@/features/wallet/components/connect-wallet-button'
import { useWallet } from '@txnlab/use-wallet'
import { Event as TauriEvent, listen } from '@tauri-apps/api/event'
import { networkConfigAtom, settingsStore } from '@/features/settings/data'
import { useNavigate } from 'react-router-dom'
import { createStore } from 'jotai'

describe('when rendering the layout page', () => {
  describe('and the wallet is not connected', () => {
    it('the connect wallet button exists', async () => {
      return executeComponentTest(
        () => render(<LayoutPage />, undefined),
        async (component) => {
          await waitFor(() => {
            const connectWalletButton = component.getByLabelText(connectWalletLabel)
            expect(connectWalletButton).toBeTruthy()
          })
        }
      )
    })

    it('the dialog should open when the connect wallet button is clicked', async () => {
      await executeComponentTest(
        () => render(<LayoutPage />, undefined),
        async (component) => {
          await waitFor(() => {
            const connectWalletButton = component.getByLabelText(connectWalletLabel)
            connectWalletButton.click()
            const dialog = component.getByRole('dialog')
            const buttons = component.getAllByRole('button')
            expect(dialog).toBeTruthy()
            expect(buttons.length).toBe(1)
          })
        }
      )
    })
  })

  describe('and the wallet is connected', () => {
    it('the wallet address is shown', async () => {
      const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet')
      vi.mocked(useWallet).mockImplementation(() => {
        return {
          ...original.useWallet(),
          activeAddress: 'CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q',
          status: 'active',
          isActive: true,
          isReady: true,
        }
      })

      await executeComponentTest(
        () => render(<LayoutPage />, undefined),
        async (component) => {
          await waitFor(async () => {
            const walletAddressAbbr = component.getByTitle('CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q')
            expect(walletAddressAbbr).toBeTruthy()

            const walletAddressText = component.getByText('CGRS...LQ5Q')
            expect(walletAddressText).toBeTruthy()

            const linkElement = component.getByRole('link', { name: /CGRS...LQ5Q/i })
            expect(linkElement.getAttribute('href')).toBe('/explore/account/CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q')
          })
        }
      )
    })
  })

  describe('and mainnet is selected', () => {
    const mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    beforeAll(() => {
      window.__TAURI__ = {}
      window.deepLink = 'algokit-explorer://network/mainnet'
    })

    it('mainnet should be selected', async () => {
      vi.mocked(listen).mockImplementation(() => {
        return Promise.resolve({
          then: () => {},
          catch: () => {},
        })
      })

      await executeComponentTest(
        () => render(<LayoutPage />, undefined),
        async () => {
          const networkConfig = settingsStore.get(networkConfigAtom)
          expect(networkConfig.id).toBe('mainnet')
        }
      )
    })

    describe('then the user triggers a deep link to testnet', () => {
      beforeAll(() => {
        vi.mocked(listen).mockImplementation((_, handler: (event: TauriEvent<string>) => void) => {
          handler({
            event: 'deep-link-received',
            windowLabel: 'main',
            id: 1,
            payload: 'algokit-explorer://network/testnet',
          })

          return Promise.resolve({
            then: () => {},
            catch: () => {},
          })
        })
      })

      it('testnet should be selected', async () => {
        await executeComponentTest(
          () => render(<LayoutPage />),
          async () => {
            const networkConfig = settingsStore.get(networkConfigAtom)
            expect(networkConfig.id).toBe('testnet')
          }
        )
      })
    })

    describe('then the user triggers a deep link to a transaction', () => {
      beforeAll(() => {
        vi.mocked(listen).mockImplementation((_, handler: (event: TauriEvent<string>) => void) => {
          handler({
            event: 'deep-link-received',
            windowLabel: 'main',
            id: 1,
            payload: 'algokit-explorer://network/mainnet/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
          })

          return Promise.resolve({
            then: () => {},
            catch: () => {},
          })
        })
      })

      it('should navigate to the transaction page', async () => {
        await executeComponentTest(
          () => render(<LayoutPage />),
          async () => {
            const networkConfig = settingsStore.get(networkConfigAtom)

            expect(networkConfig.id).toBe('mainnet')
            expect(mockNavigate).toHaveBeenCalledWith(
              `/explore/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1`
            )
          }
        )
      })
    })
  })

  describe('and no deep link is selected', () => {
    vi.mocked(settingsStore).get.mockReturnValue(createStore())

    it('localnet should be selected', () => {
      return executeComponentTest(
        () => render(<LayoutPage />),
        async () => {
          const networkConfig = settingsStore.get(networkConfigAtom)
          expect(networkConfig.id).toBe('localnet')
        }
      )
    })
  })
})
