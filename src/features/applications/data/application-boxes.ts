import { ApplicationId } from './types'
import { indexer } from '@/features/common/data'
import { useMemo } from 'react'
import { atom, useAtomValue } from 'jotai'
import { ApplicationBox, ApplicationBoxSummary } from '../models'
import { Buffer } from 'buffer'
import { loadable } from 'jotai/utils'

const fetchApplicationBoxes = async (applicationId: ApplicationId, pageSize: number, nextPageToken?: string) => {
  const results = await indexer
    .searchForApplicationBoxes(applicationId)
    .nextToken(nextPageToken ?? '')
    .limit(pageSize)
    .do()

  return {
    boxes: results.boxes.map((box) => ({ name: Buffer.from(box.name).toString('base64') })) satisfies ApplicationBoxSummary[],
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

export const useApplicationBox = (applicationId: ApplicationId, boxName: string) => {
  return useMemo(() => {
    return atom(async () => {
      const box = await indexer.lookupApplicationBoxByIDandName(applicationId, Buffer.from(boxName, 'base64')).do()
      return box.get_obj_for_encoding(false) as ApplicationBox
    })
  }, [applicationId, boxName])
}

export const useLoadableApplicationBox = (applicationId: ApplicationId, boxName: string) => {
  return useAtomValue(loadable(useApplicationBox(applicationId, boxName)))
}
