import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useVersion } from './use-version'

// Mock config module
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

// Import the mocked config module so we can modify its properties in individual tests.
const mockConfigModule = await import('@/config')
const mockConfig = mockConfigModule.default

describe('useVersion', () => {
  describe('when running in web environment', () => {
    it('should return web version information', () => {
      const { result } = renderHook(() => useVersion())

      expect(result.current).toEqual({
        version: '1.2.3',
        buildDate: '2024-01-15T10:30:00Z',
        commitHash: 'abc123def456',
        environment: 'development',
      })
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