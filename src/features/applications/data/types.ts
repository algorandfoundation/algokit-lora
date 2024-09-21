import { ApplicationResult as IndexerApplicationResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AppCallMethodCall } from '@algorandfoundation/algokit-utils/types/composer'

export type ApplicationId = number

export type ApplicationMetadataResult = {
  name: string
} | null

export type ApplicationResult = Omit<IndexerApplicationResult, 'created-at-round' | 'deleted-at-round' | 'params'> & {
  params: Omit<IndexerApplicationResult['params'], 'global-state'> & {
    'global-state'?: IndexerApplicationResult['params']['global-state']
  }
}

export type AppClientMethodCallParamsArgs = NonNullable<AppCallMethodCall['args']>[number]
