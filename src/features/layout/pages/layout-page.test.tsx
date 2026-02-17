import { executeComponentTest } from '@/tests/test-component'
import { fireEvent, render, waitFor } from '@/tests/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { LayoutPage } from '@/features/layout/pages/layout-page'
import { connectWalletLabel, selectAccountLabel, disconnectWalletLabel } from '@/features/wallet/components/connect-wallet-button'
import { NetworkId, Wallet, WalletId, useWallet } from '@txnlab/use-wallet-react'
import { AlgodClient } from '@algorandfoundation/algokit-utils/algod-client'

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
            expect(buttons.length).toBe(3)
          })
        }
      )
    })
  })

  describe('and the wallet is connected', () => {
    it('the wallet address is shown', async () => {
      const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet-react')
      vi.mocked(useWallet).mockImplementation(() => {
        return {
          ...original.useWallet(),
          activeAddress: 'CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q',
          isReady: true,
        } satisfies ReturnType<typeof useWallet>
      })

      await executeComponentTest(
        () => render(<LayoutPage />, undefined),
        async (component) => {
          await waitFor(async () => {
            const walletAddressAbbr = component.getByTitle('CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q')
            expect(walletAddressAbbr).toBeTruthy()

            const walletAddressText = component.getByText('CGRS…LQ5Q')
            expect(walletAddressText).toBeTruthy()
          })
        }
      )
    })
    describe('and there is more than one account', () => {
      it('the account switcher should be shown', async () => {
        const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet-react')
        vi.mocked(useWallet).mockImplementation(() => {
          return {
            ...original.useWallet(),
            activeAddress: 'CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q',
            activeWalletAccounts: [
              {
                address: 'CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q',
                name: 'Account 1',
              },
              {
                address: 'SOMEOTHERADDRESS',
                name: 'Account 2',
              },
            ],
            isReady: true,
          } satisfies ReturnType<typeof useWallet>
        })

        await executeComponentTest(
          () => render(<LayoutPage />, undefined),
          async (component) => {
            await waitFor(async () => {
              const selectAccountTrigger = component.getByTitle('CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q')
              expect(selectAccountTrigger).toBeTruthy()
              fireEvent.click(selectAccountTrigger)

              const selectElement = component.getByLabelText(selectAccountLabel)
              expect(selectElement).toBeTruthy()
            })
          }
        )
      })
    })

    describe('and the user disconnects the wallet', () => {
      it('the wallet should be disconnected', async () => {
        const disconnect = vi.fn()
        vi.mocked(useWallet).mockImplementation(() => {
          return {
            wallets: [
              {
                disconnect,
                isActive: true,
                id: WalletId.PERA,
                isConnected: true,
                metadata: {
                  name: 'Pera',
                  icon: 'someicon.png',
                },
              },
            ] as unknown as Wallet[],
            activeAddress: 'CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q',
            algodClient: {} as unknown as AlgodClient,
            activeNetwork: NetworkId.LOCALNET,
            setActiveNetwork: vi.fn(),
            setAlgodClient: vi.fn(),
            signTransactions: vi.fn(),
            transactionSigner: vi.fn(),
            isReady: true,
          } as unknown as ReturnType<typeof useWallet>
        })
        await executeComponentTest(
          () => render(<LayoutPage />, undefined),
          async (component) => {
            await waitFor(async () => {
              const selectAccountTrigger = component.getByTitle('CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q')
              expect(selectAccountTrigger).toBeTruthy()
              fireEvent.click(selectAccountTrigger)

              const disconnectButton = component.getByLabelText(disconnectWalletLabel)
              expect(disconnectButton).toBeTruthy()
              fireEvent.click(disconnectButton)
              expect(disconnect).toHaveBeenCalled()
            })
          }
        )
      })
    })
  })
})