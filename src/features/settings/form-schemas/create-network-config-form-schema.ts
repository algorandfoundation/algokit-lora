import { zfd } from 'zod-form-data'
import { algoServiceSchema } from '@/features/settings/form-schemas/algo-service-schema'
import { z } from 'zod'
import { WalletId } from '@txnlab/use-wallet-react'

export const createNetworkConfigFormSchema = zfd.formData({
  name: zfd.text(),
  indexer: algoServiceSchema,
  algod: algoServiceSchema,
  kmd: algoServiceSchema.optional(),
  walletIds: z.array(z.nativeEnum(WalletId)),
})
