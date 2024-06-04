import { ApplicationId } from './types'
import { useMemo } from 'react'
import { atom, useAtomValue } from 'jotai'
import { ApplicationBox, ApplicationBoxSummary } from '../models'
import { Buffer } from 'buffer'
import { loadable } from 'jotai/utils'
import { createLoadableViewModelPageAtom } from '@/features/common/data/lazy-load-pagination'
import { DEFAULT_FETCH_SIZE } from '@/features/common/constants'
import { indexer } from '@/features/common/data/algo-client'

const getApplicationBoxes = async (applicationId: ApplicationId, nextPageToken?: string) => {
  const results = await indexer
    .searchForApplicationBoxes(applicationId)
    .nextToken(nextPageToken ?? '')
    .limit(DEFAULT_FETCH_SIZE)
    .do()

  return {
    boxes: results.boxes.map((box) => ({ name: Buffer.from(box.name).toString('base64') })) satisfies ApplicationBoxSummary[],
    nextPageToken: results.nextToken,
  } as const
}

const getApplicationBox = (applicationId: ApplicationId, boxName: string) =>
  indexer.lookupApplicationBoxByIDandName(applicationId, Buffer.from(boxName, 'base64')).do()

const createApplicationBoxResultsAtom = (applicationId: ApplicationId, nextPageToken?: string) => {
  return atom(async () => {
    const { boxes, nextPageToken: newNextPageToken } = await getApplicationBoxes(applicationId, nextPageToken)

    return {
      items: boxes,
      nextPageToken: newNextPageToken,
    }
  })
}

export const useApplicationBox = (applicationId: ApplicationId, boxName: string) => {
  return useMemo(() => {
    return atom(async () => {
      const box = await getApplicationBox(applicationId, boxName)
      return box.get_obj_for_encoding(false) as ApplicationBox
    })
  }, [applicationId, boxName])
}

export const useLoadableApplicationBox = (applicationId: ApplicationId, boxName: string) => {
  return useAtomValue(loadable(useApplicationBox(applicationId, boxName)))
}

export const createLoadableApplicationBoxesPage = (applicationId: ApplicationId) => {
  return createLoadableViewModelPageAtom({
    fetchRawData: (nextPageToken?: string) => createApplicationBoxResultsAtom(applicationId, nextPageToken),
    createViewModelPageAtom: (rawDataPage) => atom(() => rawDataPage),
  })
}
