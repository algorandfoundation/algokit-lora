import { ApplicationId } from './types'
import { indexer } from '@/features/common/data'
import { useMemo } from 'react'
import { atom } from 'jotai'

const fetchApplicationBoxes = async (applicationId: ApplicationId, pageSize: number, nextPageToken?: string) => {
  const results = await indexer
    .searchForApplicationBoxes(applicationId)
    .nextToken(nextPageToken ?? '')
    .limit(pageSize)
    .do()
  return {
    boxes: results.boxes,
    nextPageToken: results.nextToken,
  } as const
}

const createApplicationBoxesAtom = (applicationId: ApplicationId, pageSize: number, nextPageToken?: string) => {
  return atom(async () => {
    const { boxes, nextPageToken: newNextPageToken } = await fetchApplicationBoxes(applicationId, pageSize, nextPageToken)

    return {
      rows: boxes,
      nextPageToken: newNextPageToken,
    }
  })
}

export const useFetchNextApplicationBoxPage = (applicationId: ApplicationId) => {
  return useMemo(() => {
    return (pageSize: number, nextPageToken?: string) => createApplicationBoxesAtom(applicationId, pageSize, nextPageToken)
  }, [applicationId])
}
