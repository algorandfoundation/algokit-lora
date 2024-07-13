import { zfd } from 'zod-form-data'
import { algoServiceSchema } from '@/features/settings/form-schemas/algo-service-schema'
import { z } from 'zod'
import { PROVIDER_ID } from '@txnlab/use-wallet'

export const createNetworkConfigFormSchema = zfd.formData({
  name: zfd.text(),
  indexer: algoServiceSchema,
  algod: algoServiceSchema,
  kmd: algoServiceSchema.optional(),
  walletProviders: z.array(z.nativeEnum(PROVIDER_ID)),
})
