import { AlgoAppSpec as Arc32AppSpec } from '@/features/abi-methods/data/types/arc-32/application'
import { ApplicationId } from '@/features/applications/data/types'

// Only ARC-32 is supported for now
export type AppSpec = {
  standard: 'ARC-32'
  validFromRound?: number
  validUntilRound?: number
  spec: Arc32AppSpec
}

export type ApplicationAppSpecs = {
  applicationId: ApplicationId
  appSpecs: AppSpec[]
}

export type { Arc32AppSpec }
