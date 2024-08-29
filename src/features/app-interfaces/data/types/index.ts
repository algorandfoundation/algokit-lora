import { AlgoAppSpec as Arc32AppSpec } from '@/features/app-interfaces/data/types/arc-32/application'

// Only ARC-32 is supported for now
export type AppSpecVersion = {
  standard: 'ARC-32'
  roundFirstValid?: number
  roundLastValid?: number
  appSpec: Arc32AppSpec
}

// TODO: replace this with algorandfoundation/algokit-utils/types/app-spec
export type { Arc32AppSpec }
