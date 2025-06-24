import { describe, it, expect, vi } from 'vitest'
import { render } from '@/tests/testing-library'
import { Settings } from './settings'

// Mock the VersionDisplay component
vi.mock('@/features/common/components/version-display', () => ({
  VersionDisplay: vi.fn(({ showDetails, showEnvironment }) => (
    <div data-testid="version-display">
      Mock VersionDisplay (details: {showDetails?.toString()}, environment: {showEnvironment?.toString()})
    </div>
  )),
}))

// Mock the other components
vi.mock('./clear-cache', () => ({
  ClearCache: vi.fn(() => <div data-testid="clear-cache">Mock ClearCache</div>),
}))

vi.mock('@/features/network/components/network-configs-table', () => ({
  NetworkConfigsTable: vi.fn(() => <div data-testid="network-configs-table">Mock NetworkConfigsTable</div>),
}))

describe('Settings', () => {
  it('should render all components', () => {
    const component = render(<Settings />)

    expect(component.getByTestId('network-configs-table')).toBeInTheDocument()
    expect(component.getByTestId('clear-cache')).toBeInTheDocument()
    expect(component.getByTestId('version-display')).toBeInTheDocument()
  })

  it('should render VersionDisplay with showDetails and showEnvironment enabled', () => {
    const component = render(<Settings />)

    const versionDisplay = component.getByTestId('version-display')
    expect(versionDisplay).toHaveTextContent('details: true')
    expect(versionDisplay).toHaveTextContent('environment: true')
  })

  it('should have proper layout structure', () => {
    const component = render(<Settings />)

    const container = component.container.firstChild as HTMLElement
    expect(container).toHaveClass('flex', 'flex-col', 'space-y-8')

    const versionContainer = component.getByTestId('version-display').parentElement as HTMLElement
    expect(versionContainer).toHaveClass('flex', 'flex-col', 'items-end', 'space-y-2')
  })
})
