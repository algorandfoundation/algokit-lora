import algosdk from 'algosdk'
import { AppCallMethodCall } from '@algorandfoundation/algokit-utils/types/composer'

export type ApplicationId = bigint

export type ApplicationMetadataResult = {
  name: string
} | null

export type ApplicationResult = Omit<
  algosdk.indexerModels.Application,
  'getEncodingSchema' | 'toEncodingData' | 'createdAtRound' | 'deletedAtRound' | 'params'
> & {
  params: Omit<
    algosdk.indexerModels.ApplicationParams,
    'getEncodingSchema' | 'toEncodingData' | 'globalState' | 'globalStateSchema' | 'localStateSchema'
  > & {
    globalState?: algosdk.indexerModels.ApplicationParams['globalState']
    globalStateSchema?: ApplicationStateSchema
    localStateSchema?: ApplicationStateSchema
  }
}

export type AppClientMethodCallParamsArgs = NonNullable<AppCallMethodCall['args']>[number]

export type ApplicationStateSchema = Omit<algosdk.indexerModels.ApplicationStateSchema, 'getEncodingSchema' | 'toEncodingData'>
