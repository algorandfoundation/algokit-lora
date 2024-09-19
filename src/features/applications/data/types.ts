import algosdk from 'algosdk'
import { ApplicationResult as IndexerApplicationResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { ABIStruct } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { AppMethodCallTransactionArgument } from '@algorandfoundation/algokit-utils/types/composer'

export type ApplicationId = number

export type ApplicationMetadataResult = {
  name: string
} | null

export type ApplicationResult = Omit<IndexerApplicationResult, 'created-at-round' | 'deleted-at-round' | 'params'> & {
  params: Omit<IndexerApplicationResult['params'], 'global-state'> & {
    'global-state'?: IndexerApplicationResult['params']['global-state']
  }
}

export type AppClientMethodCallParamsArgs = algosdk.ABIValue | ABIStruct | AppMethodCallTransactionArgument | undefined
