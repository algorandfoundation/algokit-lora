import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { LayoutPage } from '@/features/layout/pages/layout-page'
import { connectWalletLabel } from '@/features/wallet/components/connect-wallet'
import { useWallet } from '@txnlab/use-wallet'

describe('when rendering the layout page', () => {
  it('Connect wallet button exists', async () => {
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

  it('if the connect wallet button is clicked, the dialog should open', () => {
    return executeComponentTest(
      () => render(<LayoutPage />, undefined),
      async (component) => {
        await waitFor(() => {
          const connectWalletButton = component.getByLabelText(connectWalletLabel)
          connectWalletButton.click()
          const dialog = component.getByRole('dialog')
          const buttons = component.getAllByRole('button')
          expect(dialog).toBeTruthy()
          expect(buttons.length).toBe(5)
        })
      }
    )
  })
})

describe('when rendering the layout page and the wallet is connected', () => {
  it('the buton shows the wallet address', async () => {
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
