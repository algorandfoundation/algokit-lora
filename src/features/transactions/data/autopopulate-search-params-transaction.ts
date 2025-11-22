import { BaseSearchParamTransaction } from '@/features/transaction-wizard/models'
import { transformSearchParamsTransactions } from '@/features/transaction-wizard/utils/transform-search-params-transactions'
import { atom, useAtomValue } from 'jotai'
import { atomFamily, loadable } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'

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

const autopopulateAddress = atomFamily((searchParamsString: string) => {
  return atom(async () => {
    const searchParams = new URLSearchParams(searchParamsString)
    const transformedParams = transformSearchParams(searchParams)
    return await transformSearchParamsTransactions(transformedParams)
  })
})

export const useAutopopulateAddressAtom = (searchParams: URLSearchParams) => {
  return useMemo(() => {
    return autopopulateAddress(searchParams.toString())
  }, [searchParams])
}

export const useLoadableAutopopulateAddress = (searchParams: URLSearchParams) => {
  const atom = useAutopopulateAddressAtom(searchParams)
  const loadableResult = useAtomValue(loadable(atom))

  // Show toast notifications for errors
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
