import algosdk from 'algosdk'
import { AppCallMethodCall } from '@algorandfoundation/algokit-utils/types/composer'

export type ApplicationId = number

export type ApplicationMetadataResult = {
  name: string
} | null

export type ApplicationResult = Omit<algosdk.indexerModels.Application, 'createdAtRound' | 'deletedAtRound' | 'params'> & {
  params: Omit<algosdk.indexerModels.ApplicationParams, 'globalState'> & {
    globalState?: algosdk.indexerModels.ApplicationParams['globalState']
  }
}

export type AppClientMethodCallParamsArgs = NonNullable<AppCallMethodCall['args']>[number]
