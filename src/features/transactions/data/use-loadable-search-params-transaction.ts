import { BaseSearchParamTransaction } from '@/features/transaction-wizard/models'
import { transformSearchParamsTransactions } from '@/features/transaction-wizard/utils/transform-search-params-transactions'
import { atom, useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

const parseSearchParams = (searchParams: URLSearchParams): BaseSearchParamTransaction[] => {
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

const useSearchParamsTransactionsAtom = (searchParams: URLSearchParams) => {
  return useMemo(() => {
    return atom(async () => {
      const searchParamsString = new URLSearchParams(searchParams.toString())
      const parsedParams = parseSearchParams(searchParamsString)
      return await transformSearchParamsTransactions(parsedParams)
    })
  }, [searchParams])
}

export const useLoadableSearchParamsTransactions = () => {
  const [searchParams] = useSearchParams()
  const transactionsAtom = useSearchParamsTransactionsAtom(searchParams)
  const loadableResult = useAtomValue(loadable(transactionsAtom))

  useEffect(() => {
    if (loadableResult.state === 'hasData' && loadableResult.data.errors) {
      loadableResult.data.errors.forEach((error: string) => toast.error(error))
    }
    if (loadableResult.state === 'hasError') {
      const errorMessage = loadableResult.error instanceof Error ? loadableResult.error.message : 'Failed to load transactions'
      toast.error(errorMessage)
    }
  }, [loadableResult])

  return loadableResult
}
