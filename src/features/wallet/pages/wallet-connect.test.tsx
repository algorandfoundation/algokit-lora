import { describe, expect, it, vi } from 'vitest'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { PROVIDER_ID, useWallet, WalletProvider } from '@txnlab/use-wallet'
import { ConnectWalletButton } from '../components/connect-wallet'

describe('connect-wallet', () => {
  vi.mocked('@txnlab/use-wallet')
  const deflyProvider = {
    accounts: [],
    isActive: false,
    isConnected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    setActiveProvider: vi.fn(),
    setActiveAccount: vi.fn(),
    metadata: { id: 'defly', name: 'Defly Wallet', icon: 'defly-icon.png' }, //icon is requested
  }
  const peraProvider = {
    accounts: [],
    isActive: false,
    isConnected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    setActiveProvider: vi.fn(),
    setActiveAccount: vi.fn(),
    metadata: { id: 'pera', name: 'Pera Wallet', icon: 'pera-icon.png' },
  }
  const mockUseWallet = {
    activeAddress: '',
    providers: [deflyProvider, peraProvider],
    isReady: false,
  }
  vi.mocked(useWallet).mockReturnValue(mockUseWallet)

  it('should render connect wallet dialog when no active address', () => {
    const { getByText } = render(
      <WalletProvider value={mockUseWallet}>
        <ConnectWalletButton />
      </WalletProvider>
    )

    expect(getByText('Connect Wallet')).toBeTruthy()
  })

  it('should render wallet providers and allow connection', async () => {
    const { getByText, getByAltText } = render(
      <WalletProvider value={mockUseWallet}>
        <ConnectWalletButton />
      </WalletProvider>
    )

    fireEvent.click(getByText('Connect Wallet'))

    await waitFor(() => {
      expect(getByText('Select Algorand Wallet Provider')).toBeTruthy()
      expect(getByAltText('Defly Wallet icon')).toBeTruthy()
      expect(getByAltText('Pera Wallet icon')).toBeTruthy()
    })

    fireEvent.click(getByText('Defly Wallet'))

    await waitFor(() => {
      expect(mockUseWallet.providers[0].connect).toHaveBeenCalled()
    })
  })

  it('should render active address and allow disconnection', async () => {
    mockUseWallet.activeAddress = 'THE_ACTIVE_ADDRESS'
    mockUseWallet.providers[0].isActive = true

    const { getByText, getByRole } = render(
      //new mock needed as activeAddress is changed
      <WalletProvider value={mockUseWallet}>
        <ConnectWalletButton />
      </WalletProvider>
    )

    await waitFor(() => {
      expect(getByText('THE_ACTIVE_ADDRESS')).toBeTruthy()
    })

    fireEvent.mouseOver(getByText('THE_ACTIVE_ADDRESS'))

    await waitFor(() => {
      expect(getByRole('button', { name: 'Disconnect' })).toBeTruthy()
    })

    fireEvent.click(getByRole('button', { name: 'Disconnect' }))

    await waitFor(() => {
      expect(mockUseWallet.providers[0].disconnect).toHaveBeenCalled()
    })
  })
})
