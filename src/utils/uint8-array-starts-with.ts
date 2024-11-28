export const uint8ArrayStartsWith = (a: Uint8Array, b: Uint8Array): boolean => {
  return a.subarray(0, b.length).every((byte, index) => byte === b[index])
}
