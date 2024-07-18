import { ServiceConfig } from '@/features/network/data/types'
import { algoServiceSchema } from '@/features/settings/form-schemas/algo-service-schema'
import { z } from 'zod'

export const asAlgoServiceConfig = (values: z.infer<typeof algoServiceSchema>): ServiceConfig => {
  return {
    server: values.server,
    port: values.port,
    token: values.promptForToken ? undefined : values.token,
    promptForToken: values.promptForToken ?? false,
  }
}
