import { selectedNetworkAtom, settingsStore } from '@/features/settings/data'
import { executeComponentTest } from '@/tests/test-component'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LandingPage } from './landing-pages'
import { render, waitFor } from '@testing-library/react'

describe('landing page', () => {
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
  ])('when the landing url is $landingUrl', ({ landingUrl, expectedNetworkId, expectedRedirectUrl }) => {
    it('should select the expected network and redirect to the expected url', () => {
      const network = landingUrl.split('/')[1]
      vi.mocked(useParams).mockImplementation(() => ({ networkId: network }))
      vi.mocked(useLocation).mockImplementation(() => ({ pathname: landingUrl, search: '', key: '', state: undefined, hash: '' }))
      const mockNavigate = vi.fn()
      vi.mocked(useNavigate).mockReturnValue(mockNavigate)

      return executeComponentTest(
        () => render(<LandingPage />),
        async () => {
          await waitFor(async () => {
            expect(mockNavigate).toHaveBeenCalledWith(expectedRedirectUrl)
            const selectedNetwork = settingsStore.get(selectedNetworkAtom)
            expect(selectedNetwork).toBe(expectedNetworkId)
          })
        }
      )
    })
  })
})
