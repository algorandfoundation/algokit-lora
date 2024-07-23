import { ApplicationResult as IndexerApplicationResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AlgoAppSpec as Arc32AppSpec } from '@/features/arc-32/application'

export type ApplicationId = number

export type ApplicationMetadataResult =
  | {
      standard: 'ARC2'
      name: string
    }
  | ({
      standard: 'ARC32'
    } & Arc32AppSpec)
  | null

export type ApplicationResult = Omit<IndexerApplicationResult, 'created-at-round' | 'deleted-at-round' | 'params'> & {
  params: Omit<IndexerApplicationResult['params'], 'global-state'> & {
    'global-state'?: IndexerApplicationResult['params']['global-state']
  }
}
