import { Buffer } from 'buffer'

export const base64ToUtf8 = (log: string) => {
  return Buffer.from(log, 'base64').toString('utf-8')
}
