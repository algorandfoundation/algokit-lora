import { zfd } from 'zod-form-data'
import { algoServiceSchema, kmdServiceSchema } from '@/features/settings/form-schemas/algo-service-schema'

export const createNetworkConfigFormSchema = zfd.formData({
  name: zfd.text(),
  indexer: algoServiceSchema,
  algod: algoServiceSchema,
  kmd: kmdServiceSchema,
})
