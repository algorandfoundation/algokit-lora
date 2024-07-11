import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const algoServiceSchema = z.object({
  server: zfd.text(z.string().url()),
  port: zfd.numeric(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0).max(65535)),
  token: zfd.text(z.string().optional()),
  promptForToken: z.boolean().optional(),
})

export const kmdServiceSchema = z
  .object({
    server: zfd.text(z.string().url().optional()),
    port: zfd.numeric(z.number().min(0).max(65535).optional()),
    token: zfd.text(z.string().optional()),
    promptForToken: z.boolean().optional(),
  })
  .refine((data) => (data.server ? data.port !== undefined : true), {
    message: 'The port is required if the server is specified',
    path: ['port'],
  })
  .refine((data) => (data.port ? data.server : true), {
    message: 'The server is required if the port is specified',
    path: ['server'],
  })
  .refine((data) => (data.token ? data.server : true), {
    message: 'The server is required if the token is specified',
    path: ['server'],
  })
  .refine((data) => (data.token ? data.port : true), {
    message: 'The port is required if the token is specified',
    path: ['port'],
  })
