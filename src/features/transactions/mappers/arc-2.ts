import { Arc2TransactionNote } from '@algorandfoundation/algokit-utils/types/transaction'

// Based on the ARC-2 spec https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0002.md#specification
const arc2Regex = /^([a-zA-Z0-9][a-zA-Z0-9_/@.-]{4,31}):([mjbu]{1})(.*)$/

export function parseArc2(maybeArc2: string) {
  const result = maybeArc2.match(arc2Regex)
  if (result && result.length === 4) {
    return {
      dAppName: result[1],
      format: result[2] as 'm' | 'b' | 'u' | 'j',
      data: result[3],
    } satisfies Arc2TransactionNote
  }
}
