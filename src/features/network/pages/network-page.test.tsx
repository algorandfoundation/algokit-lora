import { networkConfigAtom, selectedNetworkAtom, settingsStore } from '@/features/settings/data'
import { executeComponentTest } from '@/tests/test-component'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NetworkPage } from './network-page.tsx'
import { render } from '@testing-library/react'
import { RESET } from 'jotai/utils'

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}))

describe('network page', () => {
  describe.each([
    {
      landingUrl: '/mainnet/transaction/db677wzp7hzfou5gc2uebg3onxgtng2nj2zoi6s6rgu244p6he4q',
      expectedNetworkId: 'mainnet',
      expectedRedirectUrl: '/transaction/db677wzp7hzfou5gc2uebg3onxgtng2nj2zoi6s6rgu244p6he4q',
    },
    {
      landingUrl: '/mainnet/account/SDA6DSYRY6P3JIVRA74YD37EXIBMM5FAYCIGXRSWARON6YMWHJSNU3TLDY',
      expectedNetworkId: 'mainnet',
      expectedRedirectUrl: '/account/SDA6DSYRY6P3JIVRA74YD37EXIBMM5FAYCIGXRSWARON6YMWHJSNU3TLDY',
    },
    {
      landingUrl: '/mainnet',
      expectedNetworkId: 'mainnet',
      expectedRedirectUrl: '/',
    },
    {
      landingUrl: '/mainnet/block/39508815/group/1LV9bfgvxZI0kb2kUgVJ5sy%2B1bw6OGSkRqHRrZ4C%2Fig%3D',
      expectedNetworkId: 'mainnet',
      expectedRedirectUrl: '/block/39508815/group/1LV9bfgvxZI0kb2kUgVJ5sy%2B1bw6OGSkRqHRrZ4C%2Fig%3D',
    },
    {
      landingUrl: '/mainnet/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
      expectedNetworkId: 'mainnet',
      expectedRedirectUrl: '/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
    },
    {
      landingUrl: '/testnet/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
      expectedNetworkId: 'testnet',
      expectedRedirectUrl: '/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
    },
    {
      landingUrl: '/invalid-network/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
      expectedNetworkId: 'localnet',
      expectedRedirectUrl: '/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
    },
  ])('when the network url is $landingUrl', ({ landingUrl, expectedNetworkId, expectedRedirectUrl }) => {
    afterEach(() => {
      settingsStore.set(selectedNetworkAtom, RESET)
    })

    it('should select the expected network and redirect to the expected url', async () => {
      const network = landingUrl.split('/')[1]
      vi.mocked(useParams).mockImplementation(() => ({ networkId: network }))
      vi.mocked(useLocation).mockImplementation(() => ({ pathname: landingUrl, search: '', key: '', state: undefined, hash: '' }))
      const mockNavigate = vi.fn()
      vi.mocked(useNavigate).mockReturnValue(mockNavigate)

      await executeComponentTest(
        () => render(<NetworkPage />),
        async () => {
          const selectedNetwork = settingsStore.get(networkConfigAtom)
          expect(selectedNetwork.id).toBe(expectedNetworkId)

          expect(mockNavigate).toHaveBeenCalledWith(expectedRedirectUrl)
        }
      )
    })
  })
})
