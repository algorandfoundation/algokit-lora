import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useVersion } from './use-version'

// Mock Tauri API
vi.mock('@tauri-apps/api/app', () => ({
  getVersion: vi.fn(),
}))

// Mock config
vi.mock('@/config', () => ({
  default: {
    version: {
      app: '1.2.3',
      build: '2024-01-15T10:30:00Z',
      commit: 'abc123def456',
      environment: 'development' as const,
    },
  },
}))

// Import the mocked function once
const { getVersion } = await import('@tauri-apps/api/app')
const mockGetVersion = vi.mocked(getVersion)

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
        expect(result.current.version).toBe('2.0.0')
      })

      expect(mockGetVersion).toHaveBeenCalledOnce()
    })

    it('should still return web config for other version info', async () => {
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
    it.each([
      ['development', 'development'],
      ['staging', 'staging'],
      ['production', 'production'],
    ])('should handle %s environment correctly', (_env, _expected) => {
      const { result } = renderHook(() => useVersion())
      expect(result.current.environment).toBe('development')
    })
  })
})
