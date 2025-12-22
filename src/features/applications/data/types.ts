import type { Application as IndexerApplication } from '@algorandfoundation/algokit-utils/indexer-client'
import { AppCallMethodCall } from '@algorandfoundation/algokit-utils/types/composer'

export type ApplicationId = bigint

export type ApplicationMetadataResult = {
  name: string
} | null

export type ApplicationResult = Omit<IndexerApplication, 'createdAtRound' | 'deletedAtRound'>

export type AppClientMethodCallParamsArgs = NonNullable<AppCallMethodCall['args']>[number]
