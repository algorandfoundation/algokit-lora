import { TooltipProvider } from '@radix-ui/react-tooltip'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'
import { TestPlatformProvider } from '@/tests/test-platform-provider'
import { asAsset } from '../mappers/asset'
import { AssetDetails } from './asset-details'

const template = 'template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}'
const reserve = 'AEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEA5RCDXMI'
const sampleAsset = asAsset(
  {
    index: 0n,
    params: { creator: reserve, total: 1n, decimals: 0, name: 'Example asset', url: template, reserve },
  },
  null
)

const Wrapper = ({ children }: PropsWithChildren) => (
  <TestPlatformProvider>
    <TooltipProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </TooltipProvider>
  </TestPlatformProvider>
)

describe('AssetDetails URL link', () => {
  it('updates the href when only the reserve changes', () => {
    const component = render(<AssetDetails asset={sampleAsset} />, { wrapper: Wrapper })
    expect(component.getByRole('link', { name: template })).toHaveAttribute(
      'href',
      'https://ipfs.algonode.xyz/ipfs/QmNQa1FSTXNHmrjjfgUW3Px3Vkke4oKiFWdigWkYSux2Pi'
    )
    component.rerender(
      <AssetDetails asset={{ ...sampleAsset, reserve: 'AIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBMXPWWNQ' }} />
    )
    expect(component.getByRole('link', { name: template })).toHaveAttribute(
      'href',
      'https://ipfs.algonode.xyz/ipfs/QmNUVJPjvXxb55spvBuoNKEvGWzoGzzmwLC8MAovVWhMiR'
    )
  })

  it('renders plain text when the details card receives an unusable reserve', () => {
    const component = render(<AssetDetails asset={{ ...sampleAsset, reserve: undefined }} />, { wrapper: Wrapper })
    expect(component.queryByRole('link', { name: template })).toBeNull()
    expect(component.getByText(template)).toBeTruthy()
  })
})
