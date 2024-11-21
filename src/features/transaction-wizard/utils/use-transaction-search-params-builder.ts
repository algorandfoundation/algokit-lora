import { useSearchParams } from 'react-router-dom'
import { transformSearchParamsTransactions } from './transform-search-params-transactions'
import { BaseSearchParamTransaction } from '../models'
import { toast } from 'react-toastify'
import { useEffect } from 'react'

const transformSearchParams = (searchParams: URLSearchParams) => {
  const entries = Array.from(searchParams.entries())

  // Group params by their index
  const groupedParams = entries.reduce<BaseSearchParamTransaction[]>((acc, [key, value]) => {
    const match = key.match(/^([^[]+)\[(\d+)\]$/)
    if (!match) return acc

    const [, paramName, index] = match
    const idx = parseInt(index)

    if (!acc[idx]) {
      acc[idx] = { type: '' }
    }

    acc[idx][paramName] = value
    return acc
  }, [])

  // Filter out empty entries and convert to array
  return groupedParams.filter((entry) => Object.keys(entry).length > 0)
}

export function useTransactionSearchParamsBuilder() {
  const [searchParams] = useSearchParams()
  const transformedParams = transformSearchParams(searchParams)
  const { transactions, errors } = transformSearchParamsTransactions(transformedParams)

  useEffect(() => {
    if (errors && errors.length > 0) {
      for (const error of errors) {
        toast.error(error)
      }
    }
  }, [errors])

  return transactions
}
