import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@/tests/testing-library'
import { useTablePageSize, useTablePagination } from './table-pagination'
import { act } from 'react'

describe('useTablePageSize', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return default page size initially', () => {
    const { result } = renderHook(() => useTablePageSize('transaction'))

    const [pageSize] = result.current
    expect(pageSize).toBe(10) // Default page size
  })

  it('should allow setting page size', () => {
    const { result } = renderHook(() => useTablePageSize('transaction'))

    act(() => {
      const [_, setPageSize] = result.current
      setPageSize(20)
    })

    const [pageSize] = result.current
    expect(pageSize).toBe(20)
  })

  it('should persist page size across instances', () => {
    // First instance sets page size
    const { result: result1 } = renderHook(() => useTablePageSize('transaction'))

    act(() => {
      const [_, setPageSize] = result1.current
      setPageSize(30)
    })

    // Second instance should get the persisted value
    const { result: result2 } = renderHook(() => useTablePageSize('transaction'))

    const [pageSize] = result2.current
    expect(pageSize).toBe(30)
  })

  it('should maintain separate page sizes for different contexts', () => {
    const { result: transactionResult } = renderHook(() => useTablePageSize('transaction'))
    const { result: applicationResult } = renderHook(() => useTablePageSize('application'))

    act(() => {
      const [_, setTransactionPageSize] = transactionResult.current
      setTransactionPageSize(20)
    })

    act(() => {
      const [_, setApplicationPageSize] = applicationResult.current
      setApplicationPageSize(40)
    })

    expect(transactionResult.current[0]).toBe(20)
    expect(applicationResult.current[0]).toBe(40)
  })

  it('should fallback to default for invalid page sizes', () => {
    const { result } = renderHook(() => useTablePageSize('transaction'))

    act(() => {
      const [_, setPageSize] = result.current
      setPageSize(15) // Not in pageSizeOptions
    })

    const [pageSize] = result.current
    expect(pageSize).toBe(10) // Should fallback to default
  })

  it('should handle valid page size options', () => {
    const { result } = renderHook(() => useTablePageSize('transaction'))

    const validPageSizes = [10, 20, 30, 40, 50, 100]

    for (const validSize of validPageSizes) {
      act(() => {
        const [_, setPageSize] = result.current
        setPageSize(validSize)
      })

      const [pageSize] = result.current
      expect(pageSize).toBe(validSize)
    }
  })
})

describe('useTablePagination', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return default pagination state initially', () => {
    const { result } = renderHook(() => useTablePagination('transaction'))

    const [pagination] = result.current
    expect(pagination).toEqual({
      pageIndex: 0,
      pageSize: 10,
    })
  })

  it('should allow updating page index', () => {
    const { result } = renderHook(() => useTablePagination('transaction'))

    act(() => {
      const [, setPagination] = result.current
      setPagination({ pageIndex: 2, pageSize: 10 })
    })

    const [pagination] = result.current
    expect(pagination.pageIndex).toBe(2)
    expect(pagination.pageSize).toBe(10)
  })

  it('should allow updating page size', () => {
    const { result } = renderHook(() => useTablePagination('transaction'))

    act(() => {
      const [, setPagination] = result.current
      setPagination({ pageIndex: 0, pageSize: 20 })
    })

    const [pagination] = result.current
    expect(pagination.pageIndex).toBe(0)
    expect(pagination.pageSize).toBe(20)
  })

  it('should support functional updates', () => {
    const { result } = renderHook(() => useTablePagination('transaction'))

    act(() => {
      const [, setPagination] = result.current
      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
    })

    const [pagination] = result.current
    expect(pagination.pageIndex).toBe(1)
  })

  it('should persist page size but not page index across instances', () => {
    // First instance sets pagination
    const { result: result1 } = renderHook(() => useTablePagination('transaction'))

    act(() => {
      const [, setPagination] = result1.current
      setPagination({ pageIndex: 3, pageSize: 30 })
    })

    // Second instance should get persisted page size but reset page index
    const { result: result2 } = renderHook(() => useTablePagination('transaction'))

    const [pagination] = result2.current
    expect(pagination.pageIndex).toBe(0) // Page index resets
    expect(pagination.pageSize).toBe(30) // Page size persists
  })

  it('should maintain separate pagination for different contexts', () => {
    const { result: transactionResult } = renderHook(() => useTablePagination('transaction'))
    const { result: applicationResult } = renderHook(() => useTablePagination('application'))

    act(() => {
      const [, setTransactionPagination] = transactionResult.current
      setTransactionPagination({ pageIndex: 1, pageSize: 20 })
    })

    act(() => {
      const [, setApplicationPagination] = applicationResult.current
      setApplicationPagination({ pageIndex: 2, pageSize: 40 })
    })

    const currentTransactionResult = transactionResult.current
    const currentApplicationResult = applicationResult.current

    expect(currentTransactionResult[0]).toEqual({ pageIndex: 1, pageSize: 20 })
    expect(currentApplicationResult[0]).toEqual({ pageIndex: 2, pageSize: 40 })
  })

  it('should validate page size and fallback to default for invalid values', () => {
    const { result } = renderHook(() => useTablePagination('transaction'))

    act(() => {
      const [, setPagination] = result.current
      setPagination({ pageIndex: 0, pageSize: 25 }) // Invalid page size
    })

    const [pagination] = result.current
    expect(pagination.pageSize).toBe(10) // Should fallback to default
  })

  it('should reset page index when page size changes to avoid out-of-bounds', () => {
    const { result } = renderHook(() => useTablePagination('transaction'))

    // Set initial state with high page index
    act(() => {
      const [, setPagination] = result.current
      setPagination({ pageIndex: 5, pageSize: 10 })
    })

    // Change page size - page index should be maintained if explicitly set
    act(() => {
      const [, setPagination] = result.current
      setPagination({ pageIndex: 0, pageSize: 50 }) // Explicitly reset page index
    })

    const [pagination] = result.current
    expect(pagination.pageIndex).toBe(0)
    expect(pagination.pageSize).toBe(50)
  })
})
