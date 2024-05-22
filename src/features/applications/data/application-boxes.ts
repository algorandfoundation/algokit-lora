import { ApplicationId } from './types'
import { indexer } from '@/features/common/data'
import { useMemo } from 'react'
import { atom, useAtomValue, useStore } from 'jotai'
import { ApplicationBox, ApplicationBoxSummary } from '../models'
import { Buffer } from 'buffer'
import { loadable } from 'jotai/utils'
import { createLazyLoadPageAtom } from '@/features/common/data/loadable-pagination'
import { JotaiStore } from '@/features/common/data/types'

const getApplicationBoxes = async (applicationId: ApplicationId, nextPageToken?: string) => {
  const results = await indexer
    .searchForApplicationBoxes(applicationId)
    .nextToken(nextPageToken ?? '')
    .limit(100)
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

export const createLoadableApplicationBoxPage = (applicationId: ApplicationId) => {
  const fetchApplicationBoxResults = (nextPageToken?: string) => createApplicationBoxResultsAtom(applicationId, nextPageToken)

  return (pageSize: number) => {
    const lazyLoadPageAtom = createLazyLoadPageAtom({ pageSize, fetchData: fetchApplicationBoxResults })

    const createPageAtom = (store: JotaiStore, pageNumber: number) => {
      return atom(async (get) => {
        return await get(lazyLoadPageAtom(store, pageNumber))
      })
    }

    const usePageAtom = (pageNumber: number) => {
      const store = useStore()
      return useMemo(() => {
        return createPageAtom(store, pageNumber)
      }, [store, pageNumber])
    }

    const useLoadablePage = (pageNumber: number) => {
      return useAtomValue(loadable(usePageAtom(pageNumber)))
    }

    return { useLoadablePage }
  }
}
