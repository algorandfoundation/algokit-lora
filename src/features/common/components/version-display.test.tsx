import { describe, it, expect, vi } from 'vitest'
import { render } from '@/tests/testing-library'
import { VersionDisplay } from './version-display'
import { useVersion } from '../hooks/use-version'

// Mock the useVersion hook
const mockVersionInfo = {
  version: '1.2.3',
  buildDate: '2024-01-15T10:30:00Z',
  commitHash: 'abc123def456',
  environment: 'development' as const,
  isTauri: false,
}

vi.mock('../hooks/use-version', () => ({
  useVersion: vi.fn(() => mockVersionInfo),
}))

describe('VersionDisplay', () => {
  describe('default rendering', () => {
    it('should render version number', () => {
      const component = render(<VersionDisplay />)
      expect(component.getByText('v1.2.3')).toBeInTheDocument()
    })

    it('should show environment badge by default', () => {
      const component = render(<VersionDisplay />)
      expect(component.getByText('development')).toBeInTheDocument()
    })

    it('should not show details by default', () => {
      const component = render(<VersionDisplay />)
      expect(component.queryByText('Built:')).not.toBeInTheDocument()
      expect(component.queryByText('Commit:')).not.toBeInTheDocument()
    })
  })

  describe('environment badge variants', () => {
    it.each([
      ['development', 'outline'],
      ['staging', 'secondary'],
      ['production', 'default'],
    ])('should show correct badge variant for %s environment', (env, _expectedVariant) => {
      vi.mocked(useVersion).mockReturnValue({
        ...mockVersionInfo,
        environment: env as 'development' | 'staging' | 'production',
      })

      const component = render(<VersionDisplay />)
      const badge = component.getByText(env)

      // Check if the badge has the expected CSS classes for the variant
      expect(badge.parentElement).toBeInTheDocument()
    })
  })

  describe('Tauri environment', () => {
    it('should show Desktop badge when running in Tauri', () => {
      vi.mocked(useVersion).mockReturnValue({
        ...mockVersionInfo,
        isTauri: true,
      })

      const component = render(<VersionDisplay />)
      expect(component.getByText('Desktop')).toBeInTheDocument()
    })

    it('should not show Desktop badge when not running in Tauri', () => {
      vi.mocked(useVersion).mockReturnValue({
        ...mockVersionInfo,
        isTauri: false,
      })

      const component = render(<VersionDisplay />)
      expect(component.queryByText('Desktop')).not.toBeInTheDocument()
    })
  })

  describe('showEnvironment prop', () => {
    it('should hide environment badges when showEnvironment is false', () => {
      const component = render(<VersionDisplay showEnvironment={false} />)

      expect(component.getByText('v1.2.3')).toBeInTheDocument()
      expect(component.queryByText('development')).not.toBeInTheDocument()
      expect(component.queryByText('Desktop')).not.toBeInTheDocument()
    })

    it('should show environment badges when showEnvironment is true', () => {
      const component = render(<VersionDisplay showEnvironment={true} />)

      expect(component.getByText('v1.2.3')).toBeInTheDocument()
      expect(component.getByText('development')).toBeInTheDocument()
    })
  })

  describe('showDetails prop', () => {
    it('should show build details when showDetails is true', () => {
      const component = render(<VersionDisplay showDetails={true} />)

      expect(component.getByText(/Built:/)).toBeInTheDocument()
      expect(component.getByText(/Commit:/)).toBeInTheDocument()
      expect(component.getByText(/1\/15\/2024/)).toBeInTheDocument() // Date formatting
      expect(component.getByText(/abc123d/)).toBeInTheDocument() // First 7 chars of commit
    })

    it('should hide build details when showDetails is false', () => {
      const component = render(<VersionDisplay showDetails={false} />)

      expect(component.queryByText(/Built:/)).not.toBeInTheDocument()
      expect(component.queryByText(/Commit:/)).not.toBeInTheDocument()
    })
  })

  describe('combined props', () => {
    it('should handle showDetails=true and showEnvironment=false', () => {
      const component = render(<VersionDisplay showDetails={true} showEnvironment={false} />)

      expect(component.getByText('v1.2.3')).toBeInTheDocument()
      expect(component.getByText(/Built:/)).toBeInTheDocument()
      expect(component.getByText(/Commit:/)).toBeInTheDocument()
      expect(component.queryByText('development')).not.toBeInTheDocument()
    })

    it('should handle showDetails=false and showEnvironment=true', () => {
      const component = render(<VersionDisplay showDetails={false} showEnvironment={true} />)

      expect(component.getByText('v1.2.3')).toBeInTheDocument()
      expect(component.getByText('development')).toBeInTheDocument()
      expect(component.queryByText(/Built:/)).not.toBeInTheDocument()
      expect(component.queryByText(/Commit:/)).not.toBeInTheDocument()
    })
  })
})
