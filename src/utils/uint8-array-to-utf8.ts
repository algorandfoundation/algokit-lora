export const uint8ArrayToUtf8 = (uint8Array: Uint8Array) => {
  return new TextDecoder().decode(uint8Array)
}
