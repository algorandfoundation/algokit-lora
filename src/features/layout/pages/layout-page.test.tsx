import { executeComponentTest } from '@/tests/test-component'
import { fireEvent, render, waitFor } from '@/tests/testing-library'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { LayoutPage } from '@/features/layout/pages/layout-page'
import { connectWalletLabel, selectAccountLabel, disconnectWalletLabel } from '@/features/wallet/components/connect-wallet-button'
import { PROVIDER_ID, Provider, useWallet } from '@txnlab/use-wallet'
import { Event as TauriEvent, listen } from '@tauri-apps/api/event'
import { networkConfigAtom } from '@/features/network/data'
import { useNavigate } from 'react-router-dom'
import { settingsStore } from '@/features/settings/data'

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
            expect(buttons.length).toBe(2)
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

            const walletAddressText = component.getByText('CGRS…LQ5Q')
            expect(walletAddressText).toBeTruthy()
          })
        }
      )
    })
    describe('and there is more than one account', () => {
      it('the account switcher should be shown', async () => {
        const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet')
        vi.mocked(useWallet).mockImplementation(() => {
          return {
            ...original.useWallet(),
            activeAddress: 'CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q',
            status: 'active',
            isActive: true,
            isReady: true,
            connectedActiveAccounts: [
              {
                providerId: PROVIDER_ID.PERA,
                address: 'CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q',
                name: 'Account 1',
              },
              {
                providerId: PROVIDER_ID.PERA,
                address: 'SOMEOTHERADDRESS',
                name: 'Account 2',
              },
            ],
          }
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
        const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet')
        const disconnect = vi.fn()
        vi.mocked(useWallet).mockImplementation(() => {
          return {
            ...original.useWallet(),
            activeAddress: 'CGRSYAYF2M5HNH6KYY6RPLYANVZ5ZQO4OTC3M3YPI4D6JFBXZGRUSVLQ5Q',
            status: 'active',
            isActive: true,
            isReady: true,
            providers: [
              {
                disconnect,
                isActive: true,
                metadata: {
                  id: PROVIDER_ID.PERA,
                  name: 'Pera',
                  icon: 'someicon.png',
                  isWalletConnect: true,
                },
              } as unknown as Provider,
            ],
          }
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
  describe('and the user opens a deep link to mainnet', () => {
    beforeAll(() => {
      window.__TAURI__ = {}
      window.deepLink = 'algokit-lora://mainnet'
    })
    afterAll(() => {
      window.__TAURI__ = undefined
      localStorage.clear()
    })

    it('mainnet should be selected', async () => {
      const mockNavigate = vi.fn()
      vi.mocked(useNavigate).mockReturnValue(mockNavigate)

      vi.mocked(listen).mockImplementation(() => {
        return Promise.resolve({
          then: () => {},
          catch: () => {},
        })
      })

      await executeComponentTest(
        () => render(<LayoutPage />),
        async (component) => {
          await waitFor(() => {
            const network = component.getByText('MainNet')
            expect(network).toBeTruthy()
            const networkConfig = settingsStore.get(networkConfigAtom)
            expect(networkConfig.id).toBe('mainnet')
          })
        }
      )
    })

    describe('then they open another deep link to testnet', () => {
      beforeAll(() => {})
      afterAll(() => {
        window.__TAURI__ = undefined
        localStorage.clear()
      })

      it('testnet should be selected', async () => {
        const mockNavigate = vi.fn()
        vi.mocked(useNavigate).mockReturnValue(mockNavigate)

        vi.mocked(listen).mockImplementation((_, handler: (event: TauriEvent<string>) => void) => {
          handler({
            event: 'deep-link-received',
            windowLabel: 'main',
            id: 1,
            payload: 'algokit-lora://testnet',
          })

          return Promise.resolve({
            then: () => {},
            catch: () => {},
          })
        })
        await executeComponentTest(
          () => render(<LayoutPage />),
          async (component) => {
            await waitFor(() => {
              const network = component.getByText('TestNet')
              expect(network).toBeTruthy()
              const networkConfig = settingsStore.get(networkConfigAtom)
              expect(networkConfig.id).toBe('testnet')
            })
          }
        )
      })
    })
  })

  describe('and the user opens a deep link to a transaction', () => {
    beforeAll(() => {
      window.__TAURI__ = {}
      window.deepLink = 'algokit-lora://mainnet/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1'

      vi.mocked(listen).mockImplementation(() => {
        return Promise.resolve({
          then: () => {},
          catch: () => {},
        })
      })
    })
    afterAll(() => {
      window.__TAURI__ = undefined
      localStorage.clear()
    })

    it('should navigate to the transaction page', async () => {
      const mockNavigate = vi.fn()
      vi.mocked(useNavigate).mockReturnValue(mockNavigate)

      await executeComponentTest(
        () => render(<LayoutPage />),
        async (component) => {
          await waitFor(() => {
            const network = component.getByText('MainNet')
            expect(network).toBeTruthy()
            const networkConfig = settingsStore.get(networkConfigAtom)
            expect(networkConfig.id).toBe('mainnet')
            expect(mockNavigate).toHaveBeenCalledWith(
              `/mainnet/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1`
            )
          })
        }
      )
    })
  })

  describe('and no deep link is selected', () => {
    it('localnet should be selected', () => {
      return executeComponentTest(
        () => render(<LayoutPage />),
        async (component) => {
          await waitFor(() => {
            const network = component.getByText('LocalNet')
            expect(network).toBeTruthy()
            const networkConfig = settingsStore.get(networkConfigAtom)
            expect(networkConfig.id).toBe('localnet')
          })
        }
      )
    })
  })
})
