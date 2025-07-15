import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useVersion } from './use-version'

// Mock Tauri API
vi.mock('@tauri-apps/api/app', () => ({
  getVersion: vi.fn(),
}))

// Mock config module
// Note: We define the mock config inside the factory function to avoid hoisting issues.
// vi.mock() calls are hoisted to the top of the file, so any external variables
// referenced in the factory must be accessible at that time.
vi.mock('@/config', () => {
  const mockConfig = {
    version: {
      app: '1.2.3',
      build: '2024-01-15T10:30:00Z',
      commit: 'abc123def456',
      environment: 'development' as 'development' | 'staging' | 'production',
    },
  }
  return {
    default: mockConfig,
  }
})

// Import mocked modules to get references we can work with in tests
const { getVersion } = await import('@tauri-apps/api/app')
const mockGetVersion = vi.mocked(getVersion)

// Import the mocked config module so we can modify its properties in individual tests.
const mockConfigModule = await import('@/config')
const mockConfig = mockConfigModule.default

// Mock global Tauri object
const mockTauriInternals = {
  test: true,
}

describe('useVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window.__TAURI_INTERNALS__
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).__TAURI_INTERNALS__
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when running in web environment', () => {
    it('should return web version information', () => {
      const { result } = renderHook(() => useVersion())

      expect(result.current).toEqual({
        version: '1.2.3',
        buildDate: '2024-01-15T10:30:00Z',
        commitHash: 'abc123def456',
        environment: 'development',
        isTauri: false,
      })
    })

    it('should not call Tauri getVersion', () => {
      renderHook(() => useVersion())
      expect(mockGetVersion).not.toHaveBeenCalled()
    })
  })

  describe('when running in Tauri environment', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__TAURI_INTERNALS__ = mockTauriInternals
      mockGetVersion.mockResolvedValue('2.0.0')
    })

    it('should detect Tauri environment', async () => {
      const { result } = renderHook(() => useVersion())

      await waitFor(() => {
        expect(result.current.isTauri).toBe(true)
      })
    })

    it('should use Tauri version when available', async () => {
      const { result } = renderHook(() => useVersion())

      await waitFor(() => {
        expect(result.current).toEqual({
          version: '2.0.0',
          buildDate: '2024-01-15T10:30:00Z',
          commitHash: 'abc123def456',
          environment: 'development',
          isTauri: true,
        })
      })

      expect(mockGetVersion).toHaveBeenCalledOnce()
    })

    it('should fallback to web version if Tauri getVersion fails', async () => {
      mockGetVersion.mockRejectedValue(new Error('Tauri error'))

      const { result } = renderHook(() => useVersion())

      await waitFor(() => {
        expect(result.current.isTauri).toBe(true)
      })

      // Should still show web version as fallback
      expect(result.current.version).toBe('1.2.3')
    })
  })

  describe('environment variants', () => {
    it.each(['development', 'staging', 'production'])('should handle %s environment correctly', (environment) => {
      // Directly modify the mock object's environment property for this test case.
      mockConfig.version.environment = environment as 'development' | 'staging' | 'production'

      const { result } = renderHook(() => useVersion())
      expect(result.current.environment).toBe(environment)
    })

    afterEach(() => {
      // Reset environment back to default after each test to prevent test pollution.
      mockConfig.version.environment = 'development'
    })
  })
})
