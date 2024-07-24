import { ApplicationResult as IndexerApplicationResult } from '@algorandfoundation/algokit-utils/types/indexer'

export type ApplicationId = number

export type ApplicationMetadataResult = {
  name: string
  methods: MethodSpec[]
} | null

export type MethodSpec = {
  selector: string
  signature: string
}

export type ApplicationResult = Omit<IndexerApplicationResult, 'created-at-round' | 'deleted-at-round' | 'params'> & {
  params: Omit<IndexerApplicationResult['params'], 'global-state'> & {
    'global-state'?: IndexerApplicationResult['params']['global-state']
  }
}
