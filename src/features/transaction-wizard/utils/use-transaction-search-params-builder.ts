import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { transformSearchParamsTransactions } from './transform-search-params-transactions'
import type { BaseSearchParamTransaction, BuildTransactionResult } from '../models'

const transformSearchParams = (searchParams: URLSearchParams) => {
  const entries = Array.from(searchParams.entries())

  const grouped = entries.reduce<BaseSearchParamTransaction[]>((acc, [key, value]) => {
    const match = key.match(/^([^[]+)\[(\d+)\]$/)
    if (!match) return acc
    const [, paramName, index] = match
    const idx = parseInt(index, 10)
    acc[idx] ??= { type: '' } // ensure slot exists; keep your original default
    acc[idx][paramName] = value
    return acc
  }, [])

  return grouped.filter((entry) => Object.keys(entry).length > 0)
}

export function useTransactionSearchParamsBuilder() {
  const [searchParams] = useSearchParams()

  // memoize the parsed params so effect only runs when params actually change
  const transformedParams = useMemo(
    () => transformSearchParams(searchParams),
    // URLSearchParams is mutable; tie memoization to its string form
    [searchParams]
  )

  const [transactions, setTransactions] = useState<BuildTransactionResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadTransactions = async () => {
      setLoading(true)
      try {
        const { transactions, errors = [] } = await transformSearchParamsTransactions(transformedParams)
        if (!mounted) return
        setTransactions(transactions)
        errors.forEach((error) => toast.error(error))
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadTransactions()
    return () => {
      mounted = false
    }
  }, [transformedParams])

  return { transactions, loading }
}
