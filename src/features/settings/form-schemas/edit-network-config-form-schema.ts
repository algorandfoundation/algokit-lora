import { zfd } from 'zod-form-data'
import { algoServiceSchema, kmdServiceSchema } from '@/features/settings/form-schemas/algo-service-schema'
import { z } from 'zod'

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
})
export const editNetworkConfigFormSchema = zfd.formData({
  networkId: zfd.text(),
  name: zfd.text(),
  indexer: algoServiceSchema,
  algod: algoServiceSchema,
  kmd: kmdServiceSchema,
  walletProviders: z.array(optionSchema),
})
