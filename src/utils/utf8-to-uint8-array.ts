export function utf8ToUint8Array(arg: string): Uint8Array {
  return Uint8Array.from(Buffer.from(arg, 'utf-8'))
}
