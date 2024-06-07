import { executeComponentTest } from '@/tests/test-component'
import { fireEvent, render, waitFor } from '@/tests/testing-library'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { LayoutPage } from '@/features/layout/pages/layout-page'
import { connectWalletLabel, selectAccountLabel, disconnectWalletLabel } from '@/features/wallet/components/connect-wallet-button'
import { PROVIDER_ID, Provider, useWallet } from '@txnlab/use-wallet'
import { Event as TauriEvent, listen } from '@tauri-apps/api/event'
import { networkConfigAtom, settingsStore } from '@/features/settings/data'
import { useNavigate } from 'react-router-dom'

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
          })
        }
      )
    })
    describe('and there are more than one account', () => {
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
        // vi.mocked(useWallet().disconnect).mockReturnValue(mockNavigate)
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
                  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNzcgMTg3Ij48cmVjdCB4PSItMTEuMzgiIHk9Ii0yNS45NyIgd2lkdGg9IjIwMC4wMiIgaGVpZ2h0PSIyMzEuNTMiIHN0eWxlPSJmaWxsOiNmZTU7Ii8+PHBhdGggZD0iTTk0LjA1LDU5LjYxYzIuMDUsOC40OCwxLjM2LDE1Ljk0LTEuNTUsMTYuNjYtMi45LC43Mi02LjkxLTUuNTctOC45Ni0xNC4wNS0yLjA1LTguNDgtMS4zNi0xNS45NCwxLjU1LTE2LjY2LDIuOS0uNzIsNi45MSw1LjU3LDguOTYsMTQuMDVaIiBzdHlsZT0iZmlsbDojMWMxYzFjOyIvPjxwYXRoIGQ9Ik0xMjcuODUsNjYuOWMtNC41My00LjgxLTEzLjU1LTMuNS0yMC4xNSwyLjkxLTYuNTksNi40MS04LjI2LDE1LjUtMy43MywyMC4zMSw0LjUzLDQuOCwxMy41NSwzLjUsMjAuMTUtMi45MXM4LjI2LTE1LjUsMy43My0yMC4zMVoiIHN0eWxlPSJmaWxsOiMxYzFjMWM7Ii8+PHBhdGggZD0iTTkxLjc5LDE0MC40N2MyLjktLjcyLDMuNDktOC42LDEuMzItMTcuNjEtMi4xNy05LTYuMjktMTUuNzEtOS4xOS0xNC45OS0yLjksLjcyLTMuNDksOC42LTEuMzIsMTcuNjEsMi4xNyw5LDYuMjksMTUuNzEsOS4xOSwxNC45OVoiIHN0eWxlPSJmaWxsOiMxYzFjMWM7Ii8+PHBhdGggZD0iTTYyLjIyLDcxLjNjOC4zNywyLjQ3LDE0LjQ4LDYuOCwxMy42Niw5LjY3LS44MywyLjg3LTguMjgsMy4yLTE2LjY1LC43My04LjM3LTIuNDctMTQuNDgtNi44LTEzLjY2LTkuNjcsLjgzLTIuODcsOC4yOC0zLjIsMTYuNjUtLjczWiIgc3R5bGU9ImZpbGw6IzFjMWMxYzsiLz48cGF0aCBkPSJNMTE2LjU0LDEwMy43NGM4Ljg4LDIuNjIsMTUuNDEsNy4wNywxNC41OSw5Ljk0LS44MywyLjg3LTguNywzLjA4LTE3LjU4LC40Ni04Ljg4LTIuNjItMTUuNDEtNy4wNy0xNC41OS05Ljk0LC44My0yLjg3LDguNy0zLjA4LDE3LjU4LS40NloiIHN0eWxlPSJmaWxsOiMxYzFjMWM7Ii8+PHBhdGggZD0iTTcxLjY0LDk3LjcxYy0yLjA4LTIuMTUtOC44OCwuOTgtMTUuMiw2Ljk5LTYuMzIsNi4wMS05Ljc2LDEyLjYzLTcuNjksMTQuNzgsMi4wOCwyLjE1LDguODgtLjk4LDE1LjItNi45OSw2LjMyLTYuMDEsOS43Ni0xMi42Myw3LjY5LTE0Ljc4WiIgc3R5bGU9ImZpbGw6IzFjMWMxYzsiLz48L3N2Zz4=',
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
      window.deepLink = 'algokit-explorer://mainnet'
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
        async () => {
          const networkConfig = settingsStore.get(networkConfigAtom)
          expect(networkConfig.id).toBe('mainnet')
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
            payload: 'algokit-explorer://testnet',
          })

          return Promise.resolve({
            then: () => {},
            catch: () => {},
          })
        })
        await executeComponentTest(
          () => render(<LayoutPage />),
          async () => {
            const networkConfig = settingsStore.get(networkConfigAtom)
            expect(networkConfig.id).toBe('testnet')
          }
        )
      })
    })
  })

  describe('and the user opens a deep link to a transaction', () => {
    beforeAll(() => {
      window.__TAURI__ = {}
      window.deepLink = 'algokit-explorer://mainnet/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1'

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
        async () => {
          const networkConfig = settingsStore.get(networkConfigAtom)

          expect(networkConfig.id).toBe('mainnet')
          expect(mockNavigate).toHaveBeenCalledWith(`/explore/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1`)
        }
      )
    })
  })

  describe('and no deep link is selected', () => {
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
