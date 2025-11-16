import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { transformSearchParamsTransactions } from './transform-search-params-transactions'
import type { BaseSearchParamTransaction, BuildTransactionResult } from '../models'

const transformSearchParams = (searchParams: URLSearchParams) => {
  const entries = Array.from(searchParams.entries())

  const groupedParams = entries.reduce<BaseSearchParamTransaction[]>((acc, [key, value]) => {
    const match = key.match(/^([^[]+)\[(\d+)\]$/)
    if (!match) return acc
    const [, paramName, index] = match
    const idx = parseInt(index, 10)
    acc[idx] ??= { type: '' }
    acc[idx][paramName] = value
    return acc
  }, [])

  return groupedParams.filter((entry) => Object.keys(entry).length > 0)
}

export function useTransactionSearchParamsBuilder() {
  const [searchParams] = useSearchParams()
  const [transactions, setTransactions] = useState<BuildTransactionResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadTransactions = async () => {
      setLoading(true)
      try {
        const transformedParams = transformSearchParams(searchParams)
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
  }, [searchParams])

  return { transactions, loading }
}
