import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const algoServiceSchema = z.object({
  server: zfd.text(z.string().url()),
  port: zfd.numeric(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0).max(65535)),
  token: zfd.text(z.string().optional()),
  promptForToken: z.boolean().optional(),
})
