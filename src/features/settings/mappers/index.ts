import { ServiceConfig } from '@/features/network/data/types'
import { algoServiceSchema } from '@/features/settings/form-schemas/algo-service-schema'
import { z } from 'zod'

export const asStorableServiceConfig = (values: z.infer<typeof algoServiceSchema>): ServiceConfig => {
  const promptForToken = values.promptForToken ?? false
  return {
    server: values.server,
    port: values.port,
    token: promptForToken === false ? values.token : undefined,
    promptForToken,
  }
}
