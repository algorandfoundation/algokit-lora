import { useTitle } from '@/utils/use-title'
import { render, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { expect, test, vi } from 'vitest'

// This is to override the mocks for react-router-dom in src/test/setup/mocks for this test
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
}))

type TestCase = {
  routePathName: string
  routePath: string
  url: string
  pagePrefix?: string
  expectedText: string
}
const testCases: TestCase[] = [
  {
    routePathName: 'Explore',
    routePath: '/:networkId',
    url: '/mainnet',
    pagePrefix: 'Explore',
    expectedText: 'Lora Explore mainnet',
  },
  {
    routePathName: 'Explore_Transaction_ById',
    routePath: '/:networkId/transaction/:transactionId',
    url: '/mainnet/transaction/CFNKY4JV5BMIRSP2SMZE634DYB22FALLURI72U6UMWZNKEBOYEMQ',
    expectedText: 'Lora Txn:CFNKY4J… mainnet',
  },
  {
    routePathName: 'Explore_Transaction_ById_Inner_ById',
    routePath: '/:networkId/transaction/:transactionId/inner/*',
    url: '/mainnet/transaction/CFNKY4JV5BMIRSP2SMZE634DYB22FALLURI72U6UMWZNKEBOYEMQ/inner/1',
    expectedText: 'Lora Txn:CFNKY4J… Inner:1 mainnet',
  },
  {
    routePathName: 'Explore_Block_ByRound',
    routePath: '/:networkId/block/:round',
    url: '/mainnet/block/43904244',
    expectedText: 'Lora Block:43904244 mainnet',
  },
  {
    routePathName: 'Explore_Block_ByRound_Group_ById',
    routePath: '/:networkId/block/:round/group/:groupId',
    url: '/mainnet/block/43904244/group/iUE01XrzcJZ+ENIwPyjPmtaVUF5OKy8vYYOwGbdKliQ=',
    expectedText: 'Lora Block:43904244 Group:iUE01Xr… mainnet',
  },
  {
    routePathName: 'Explore_Account_ByAddress',
    routePath: '/:networkId/account/:address',
    url: '/mainnet/account/W2IZ3EHDRW2IQNPC33CI2CXSLMFCFICVKQVWIYLJWXCTD765RW47ONNCEY',
    expectedText: 'Lora Acct:W2IZ…NCEY mainnet',
  },
  {
    routePathName: 'Explore_Asset_ById',
    routePath: '/:networkId/asset/:assetId',
    url: '/localnet/asset/1014',
    expectedText: 'Lora Asset:1014 localnet',
  },
  {
    routePathName: 'Explore_Application_ById',
    routePath: '/:networkId/application/:applicationId',
    url: '/localnet/application/1019',
    expectedText: 'Lora App:1019 localnet',
  },
  {
    routePathName: 'Custom_Page_Prefix',
    routePath: '/txn-wizard',
    url: '/txn-wizard',
    pagePrefix: 'Custom Prefix',
    expectedText: 'Lora Custom Prefix',
  },
]

const TestComponent = ({ pagePrefix }: { pagePrefix?: string }) => {
  useTitle(pagePrefix)
  return <div>test</div>
}

testCases.forEach(({ routePathName, routePath, url, pagePrefix, expectedText }) => {
  test(`useTitle - ${routePathName}`, async () => {
    const router = createMemoryRouter([{ path: routePath, element: <TestComponent pagePrefix={pagePrefix} /> }], {
      initialEntries: [url],
    })
    render(<RouterProvider router={router} />)
    await waitFor(() => {
      expect(document.title).toEqual(expectedText)
    })
  })
})
