import type {
  Application as IndexerApplication,
  ApplicationParams as IndexerApplicationParams,
  ApplicationStateSchema as IndexerApplicationStateSchema,
  TealKeyValueStore,
} from '@algorandfoundation/algokit-utils/indexer-client'
import { AppCallMethodCall } from '@algorandfoundation/algokit-utils/types/composer'

export type ApplicationId = bigint

export type ApplicationMetadataResult = {
  name: string
} | null

export type ApplicationResult = Omit<IndexerApplication, 'createdAtRound' | 'deletedAtRound' | 'params'> & {
  params: Omit<IndexerApplicationParams, 'globalState' | 'globalStateSchema' | 'localStateSchema'> & {
    globalState?: TealKeyValueStore
    globalStateSchema?: ApplicationStateSchema
    localStateSchema?: ApplicationStateSchema
  }
}

export type AppClientMethodCallParamsArgs = NonNullable<AppCallMethodCall['args']>[number]

export type ApplicationStateSchema = IndexerApplicationStateSchema
