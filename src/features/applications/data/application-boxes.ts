import { ApplicationId } from './types'
import { useMemo } from 'react'
import { atom, useAtomValue } from 'jotai'
import { Application, ApplicationBox, BoxDescriptor } from '../models'
import { Buffer } from 'buffer'
import { loadable } from 'jotai/utils'
import { createLoadableViewModelPageAtom } from '@/features/common/data/lazy-load-pagination'
import { DEFAULT_FETCH_SIZE } from '@/features/common/constants'
import { indexer } from '@/features/common/data/algo-client'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { asBoxDescriptor } from '../mappers'
import { base64ToUtf8IfValid } from '@/utils/base64-to-utf8'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { asDecodedAbiStorageValue } from '@/features/abi-methods/mappers'
import { uint8ArrayToUtf8 } from '@/utils/uint8-array-to-utf8'

const getApplicationBoxNames = async (applicationId: ApplicationId, appSpec?: Arc56Contract, nextPageToken?: string) => {
  const results = await indexer
    .searchForApplicationBoxes(applicationId)
    .nextToken(nextPageToken ?? '')
    .limit(DEFAULT_FETCH_SIZE)
    .do()

  return {
    boxes: results.boxes.map((box) => asBoxDescriptor(Buffer.from(box.name).toString('base64'), appSpec)),
    nextPageToken: results.nextToken,
  } as const
}

const getApplicationBox = (applicationId: ApplicationId, base64BoxName: string) =>
  indexer.lookupApplicationBoxByIDandName(applicationId, Buffer.from(base64BoxName, 'base64')).do()

const createApplicationBoxResultsAtom = (applicationId: ApplicationId, appSpec?: Arc56Contract, nextPageToken?: string) => {
  return atom(async () => {
    const { boxes, nextPageToken: newNextPageToken } = await getApplicationBoxNames(applicationId, appSpec, nextPageToken)

    return {
      items: boxes,
      nextPageToken: newNextPageToken,
    }
  })
}

export const useApplicationBox = (application: Application, boxDescriptor: BoxDescriptor) => {
  return useMemo(() => {
    return atom(async () => {
      const result = await getApplicationBox(application.id, boxDescriptor.base64Name)
      const box = {
        name: uint8ArrayToUtf8(result.name),
        value: uint8ArrayToUtf8(result.value),
      } as ApplicationBox

      if (application.appSpec && 'valueType' in boxDescriptor) {
        return asDecodedAbiStorageValue(application.appSpec, boxDescriptor.valueType, base64ToBytes(box.value))
      } else {
        return base64ToUtf8IfValid(box.value)
      }
    })
  }, [application, boxDescriptor])
}

export const useLoadableApplicationBox = (application: Application, boxDescriptor: BoxDescriptor) => {
  return useAtomValue(loadable(useApplicationBox(application, boxDescriptor)))
}

export const createLoadableApplicationBoxesPage = (application: Application) => {
  return createLoadableViewModelPageAtom({
    fetchRawData: (nextPageToken?: string) => createApplicationBoxResultsAtom(application.id, application.appSpec, nextPageToken),
    createViewModelPageAtom: (rawDataPage) => atom(() => rawDataPage),
  })
}
