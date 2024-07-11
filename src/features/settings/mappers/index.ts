import { ServiceConfig } from '@/features/settings/data'
import { algoServiceSchema, kmdServiceSchema } from '@/features/settings/form-schemas/algo-service-schema'
import { z } from 'zod'

export const asAlgoServiceConfig = (values: z.infer<typeof algoServiceSchema>): ServiceConfig => {
  return {
    server: values.server,
    port: values.port,
    token: values.promptForToken ? undefined : values.token,
    promptForToken: values.promptForToken ?? false,
  }
}

export const asKmdServiceConfig = (values: z.infer<typeof kmdServiceSchema>): ServiceConfig | undefined => {
  return values.server && values.port
    ? {
        server: values.server,
        port: values.port,
        token: values.promptForToken ? undefined : values.token,
        promptForToken: values.promptForToken ?? false,
      }
    : undefined
}
